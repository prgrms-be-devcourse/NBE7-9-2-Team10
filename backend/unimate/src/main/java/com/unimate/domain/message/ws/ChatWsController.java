package com.unimate.domain.message.ws;

import com.unimate.domain.chatroom.entity.Chatroom;
import com.unimate.domain.chatroom.entity.ChatroomStatus;
import com.unimate.domain.chatroom.service.ChatroomService;
import com.unimate.domain.message.dto.MessageType;
import com.unimate.domain.message.dto.WsMessagePush;
import com.unimate.domain.message.dto.WsSendAckResponse;
import com.unimate.domain.message.dto.WsSendMessageRequest;
import com.unimate.domain.message.entity.Message;
import com.unimate.domain.message.repository.MessageRepository;
import com.unimate.global.jwt.CustomUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.format.DateTimeFormatter;

@Controller
@RequiredArgsConstructor
public class ChatWsController {

    private final ChatroomService chatroomService;
    private final MessageRepository messageRepository;
    private final SimpMessageSendingOperations messagingTemplate;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @MessageMapping("/chat.send")
    @Transactional
    public void sendMessage(
            Principal principal,
            WsSendMessageRequest req,
            SimpMessageHeaderAccessor sha
    ) {
        // [0] Principal 해석
        CustomUserPrincipal user = null;

        if (principal instanceof Authentication a && a.getPrincipal() instanceof CustomUserPrincipal cup) {
            user = cup;
        }

        if (user == null && sha != null && sha.getUser() instanceof Authentication a2
                && a2.getPrincipal() instanceof CustomUserPrincipal cup2) {
            user = cup2;
        }

        if (user == null) {
            throw new org.springframework.security.access.AccessDeniedException("인증되지 않은 사용자입니다.");
        }

        final Long userId = user.getUserId();
        final String userNameKey = user.getName();

        try {
            // 권한/방 상태 검증
            Chatroom room = chatroomService.validateWritable(userId, req.getChatroomId());
            if (room.getStatus() == ChatroomStatus.CLOSED) {
                throw new IllegalStateException("대화가 종료된 채팅방입니다.");
            }

            // 멱등 처리
            Message msg = messageRepository
                    .findByChatroom_IdAndSenderIdAndClientMessageId(
                            req.getChatroomId(), userId, req.getClientMessageId())
                    .orElse(null);

            if (msg == null) {
                try {
                    msg = messageRepository.save(
                            Message.builder()
                                    .chatroom(room)
                                    .senderId(userId)
                                    .content(req.getContent())
                                    .clientMessageId(req.getClientMessageId())
                                    .build()
                    );
                    room.bumpLastMessage(msg.getId(), msg.getCreatedAt());
                } catch (DataIntegrityViolationException dup) {
                    msg = messageRepository
                            .findByChatroom_IdAndSenderIdAndClientMessageId(
                                    req.getChatroomId(), userId, req.getClientMessageId())
                            .orElseThrow(() -> dup);
                }
            }

            String ts = msg.getCreatedAt().format(ISO);

            // 방 브로드캐스트
            WsMessagePush push = WsMessagePush.builder()
                    .messageId(msg.getId())
                    .chatroomId(room.getId())
                    .senderId(userId)
                    .type(MessageType.TEXT)
                    .content(msg.getContent())
                    .createdAt(ts)
                    .build();
            messagingTemplate.convertAndSend("/sub/chatroom." + room.getId(), push);

            // 보낸 당사자 ACK
            WsSendAckResponse ack = WsSendAckResponse.builder()
                    .clientMessageId(req.getClientMessageId())
                    .messageId(msg.getId())
                    .status("OK")
                    .createdAt(ts)
                    .build();
            messagingTemplate.convertAndSendToUser(userNameKey, "/queue/chat.ack", ack);

        } catch (Exception e) {
            throw e;
        }
    }
}
