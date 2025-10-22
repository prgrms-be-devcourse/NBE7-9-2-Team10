package com.unimate.domain.chatroom.service;

import com.unimate.domain.chatroom.dto.*;
import com.unimate.domain.chatroom.entity.Chatroom;
import com.unimate.domain.chatroom.entity.ChatroomStatus;
import com.unimate.domain.chatroom.repository.ChatroomRepository;
import com.unimate.domain.message.entity.Message;
import com.unimate.domain.message.repository.MessageRepository;
import com.unimate.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatroomService {

    private final ChatroomRepository chatroomRepository;
    private final MessageRepository messageRepository;
    private final com.unimate.domain.user.user.repository.UserRepository userRepository;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    //내부유틸
    private Chatroom getRoomOrThrow(Long chatroomId) {
        return chatroomRepository.findById(chatroomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방을 찾을 수 없습니다."));
    }

    private void assertMember(Long me, Chatroom room) {
        if (me == null || (!me.equals(room.getUser1Id()) && !me.equals(room.getUser2Id()))) {
            throw new AccessDeniedException("채팅방에 참여 중인 사용자가 아닙니다.");
        }
    }

    private Long partnerIdOf(Long me, Chatroom room) {
        return me.equals(room.getUser1Id()) ? room.getUser2Id() : room.getUser1Id();
    }

    private static LocalDateTime coalesceLastAt(Chatroom r) {
        return (r.getLastMessageAt() != null) ? r.getLastMessageAt() : r.getCreatedAt();
    }

    //방 생성(멱등)
    @Transactional
    public ChatRoomCreateResponse createIfNotExists(Long me, Long partnerId) {
        if (me == null || partnerId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 사용자 ID입니다.");
        }
        if (me.equals(partnerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "자기 자신과의 채팅은 불가능합니다.");
        }

        long a = Math.min(me, partnerId);
        long b = Math.max(me, partnerId);

        Chatroom room = chatroomRepository.findBySmallerUserIdAndLargerUserId(a, b)
                .orElseGet(() -> chatroomRepository.save(Chatroom.create(me, partnerId)));

        return new ChatRoomCreateResponse(
                room.getId(),
                room.getUser1Id(),
                room.getUser2Id(),
                room.getStatus().name(),
                ISO.format(room.getCreatedAt())
        );
    }

    //방 상세
    public ChatRoomDetailResponse getDetail(Long me, Long chatroomId) {
        Chatroom room = getRoomOrThrow(chatroomId);
        assertMember(me, room);
        
        // 상대방 ID 및 정보 조회
        Long partnerId = partnerIdOf(me, room);
        // 상대방이 존재하는지 확인
        boolean isPartnerDeleted = !userRepository.existsById(partnerId);

        String partnerName;
        String partnerUniversity;

        if (isPartnerDeleted) {
            partnerName = "탈퇴한 사용자";
            partnerUniversity = "";
        } else {
            partnerName = userRepository.findById(partnerId)
                    .map(com.unimate.domain.user.user.entity.User::getName)
                    .orElse("알 수 없는 사용자");
            partnerUniversity = userRepository.findById(partnerId)
                    .map(com.unimate.domain.user.user.entity.User::getUniversity)
                    .orElse("");
        }
        
        return new ChatRoomDetailResponse(
                room.getId(),
                room.getUser1Id(),
                room.getUser2Id(),
                partnerName,
                partnerUniversity,
                isPartnerDeleted,
                room.getStatus().name(),
                ISO.format(room.getCreatedAt()),
                ISO.format(room.getUpdatedAt()),
                room.getLastReadMessageIdUser1(),
                room.getLastReadMessageIdUser2()
        );
    }

    ///내 방 목록
    public ChatRoomListResponse listMyRooms(Long me, String cursor, int limit, ChatroomStatus status) {
        // status가 null이면 ACTIVE만 조회 (CLOSED 제외)
        if (status == null) {
            status = ChatroomStatus.ACTIVE;
        }

        LocalDateTime cursorAt = null;
        if (cursor != null && !cursor.isBlank()) {
            try {
                cursorAt = LocalDateTime.parse(cursor, ISO);
            } catch (Exception ignore) {
                // 잘못된 커서는 무시 (최신부터)
            }
        }

        // DB 조회
        List<Chatroom> rooms = chatroomRepository.findRoomsByUserWithCursor(me, status, cursorAt, limit);

        List<ChatRoomListResponse.ChatRoomListItem> items = rooms.stream().map(r -> {
            // 마지막 메시지 요약: 레포에서 top 메시지 조회
            ChatRoomListResponse.LastMessageSummary last = null;
            if (r.getLastMessageId() != null) {
                Message m = messageRepository.findById(r.getLastMessageId()).orElse(null);
                if (m != null && m.getCreatedAt() != null) {
                    last = new ChatRoomListResponse.LastMessageSummary(
                            m.getId(),
                            m.getContent(),
                            ISO.format(m.getCreatedAt())
                    );
                } else if (r.getLastMessageAt() != null) {
                    last = new ChatRoomListResponse.LastMessageSummary(
                            r.getLastMessageId(),
                            null,
                            ISO.format(r.getLastMessageAt())
                    );
                }
            }

            Long partnerId = partnerIdOf(me, r);
            
            // 상대방 이름 조회
            String partnerName = userRepository.findById(partnerId)
                    .map(com.unimate.domain.user.user.entity.User::getName)
                    .orElse("알 수 없는 사용자");

            // 내 읽음 기준 이후의 안읽은 메시지 수 집계 (상대방이 보낸 것만)
            Long myLastRead = me.equals(r.getUser1Id()) ? r.getLastReadMessageIdUser1() : r.getLastReadMessageIdUser2();
            long unread = 0L;
            if (myLastRead != null) {
                // 상대방이 보낸 메시지만 카운트
                unread = messageRepository.countByChatroom_IdAndIdGreaterThanAndSenderId(r.getId(), myLastRead, partnerId);
            } else {
                // 상대방이 보낸 메시지만 카운트
                unread = messageRepository.countByChatroom_IdAndSenderId(r.getId(), partnerId);
            }

            return new ChatRoomListResponse.ChatRoomListItem(
                    r.getId(),
                    partnerId,
                    partnerName,
                    last,
                    unread,
                    r.getStatus().name(),
                    ISO.format(r.getUpdatedAt())
            );
        }).toList();

        // nextCursor: 마지막 방의 마지막활동시각 (없거나 덜 채워졌으면 null)
        String nextCursorOut = null;
        if (!rooms.isEmpty() && rooms.size() == limit) {
            LocalDateTime lastKey = coalesceLastAt(rooms.get(rooms.size() - 1));
            nextCursorOut = ISO.format(lastKey);
        }

        return new ChatRoomListResponse(items, nextCursorOut);
    }

    //메시지 히스토리(보조 REST)
    public ChatHistoryResponse getHistory(Long me, Long chatroomId, Long beforeMessageId, int limit) {
        Chatroom room = getRoomOrThrow(chatroomId);
        assertMember(me, room);

        PageRequest pr = PageRequest.of(0, limit);
        List<Message> messages;

        if (beforeMessageId == null) {
            messages = messageRepository.findByChatroom_IdOrderByIdDesc(chatroomId, pr);
        } else {
            if (!messageRepository.existsByIdAndChatroom_Id(beforeMessageId, chatroomId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid cursor");
            }
            messages = messageRepository.findByChatroom_IdAndIdLessThanOrderByIdDesc(chatroomId, beforeMessageId, pr);
        }

        List<ChatHistoryResponse.ChatMessageItem> items = messages.stream()
                .map(m -> new ChatHistoryResponse.ChatMessageItem(
                        m.getId(),
                        m.getChatroom().getId(),
                        m.getSenderId(),
                        m.getContent(),
                        ISO.format(m.getCreatedAt())
                ))
                .toList();

        String next = messages.isEmpty() ? null : String.valueOf(messages.get(messages.size() - 1).getId());
        return new ChatHistoryResponse(items, next);
    }

    //읽음 처리
    @Transactional
    public ChatReadResponse updateLastRead(Long me, Long chatroomId, Long lastReadMessageId) {
        Chatroom room = getRoomOrThrow(chatroomId);
        assertMember(me, room);

        // lastReadMessageId가 해당 방의 메시지인지 체크
        if (lastReadMessageId != null &&
                !messageRepository.existsByIdAndChatroom_Id(lastReadMessageId, chatroomId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 메시지 ID입니다.");
        }

        room.updateLastRead(me, lastReadMessageId);

        String updatedAt = ISO.format(LocalDateTime.now());
        return new ChatReadResponse(chatroomId, me, lastReadMessageId, updatedAt);
    }

    //나가기(채팅방을 완전히 삭제하지 않고 사용자만 채팅방에서 나가기 처리)
    //상대방은 채팅방 목록에서 볼 수 있지만 메시지 전송은 불가능
    @Transactional
    public ChatRoomLeaveResponse leave(Long me, Long chatroomId) {
        Chatroom room = getRoomOrThrow(chatroomId);
        assertMember(me, room);
        room.block(me);
        return new ChatRoomLeaveResponse(
                room.getId(),
                room.getStatus().name(),
                ISO.format(LocalDateTime.now())
        );
    }

    //차단 (응답 바디 없음) -> 채팅창에서 신고시 차단도 같이 처리되도록할 예정, 아직 사용 안함
    /*
    @Transactional
    public void block(Long me, Long chatroomId) {
        Chatroom room = getRoomOrThrow(chatroomId);
        assertMember(me, room);
        room.block(me);
    }
     */

    public Chatroom validateReadable(Long userId, Long chatroomId) {
        Chatroom room = getRoomOrThrow(chatroomId);
        if (!room.getUser1Id().equals(userId) && !room.getUser2Id().equals(userId)) {
            throw ServiceException.forbidden("해당 채팅방에 대한 권한이 없습니다.");
        }
        return room;
    }

    // WS 전송 전 검증
    public Chatroom validateWritable(Long senderId, Long chatroomId) {
        Chatroom room = getRoomOrThrow(chatroomId); // 404 매핑
        assertMember(senderId, room);               // 멤버 권한 체크


        if (room.getStatus() == ChatroomStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "닫힌 채팅방입니다.");
        }

        if (room.getBlockedBy() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "차단된 채팅방입니다.");
        }
        return room;
    }

}