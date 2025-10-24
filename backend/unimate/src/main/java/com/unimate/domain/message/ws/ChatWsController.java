package com.unimate.domain.message.ws;

import com.unimate.domain.chatroom.entity.Chatroom;
import com.unimate.domain.chatroom.service.ChatroomService;
import com.unimate.domain.chatroom.service.UserSessionService;
import com.unimate.domain.message.dto.MessageType;
import com.unimate.domain.message.dto.WsMessagePush;
import com.unimate.domain.message.dto.WsSendAckResponse;
import com.unimate.domain.message.dto.WsSendMessageRequest;
import com.unimate.domain.message.entity.Message;
import com.unimate.domain.message.repository.MessageRepository;
import com.unimate.domain.notification.entity.NotificationType;
import com.unimate.domain.notification.service.NotificationService;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.global.jwt.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.format.DateTimeFormatter;

@Controller
@RequiredArgsConstructor
@Tag(name = "ChatWsController", description = "채팅방 WebSocket API")
public class ChatWsController {

    private final ChatroomService chatroomService;
    private final MessageRepository messageRepository;
    private final SimpMessageSendingOperations messagingTemplate;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final UserSessionService userSessionService;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @MessageMapping("/chat.send")
    public void sendMessage(
            Principal principal,
            WsSendMessageRequest req,
            SimpMessageHeaderAccessor sha
    ) {
        // Principal 해석
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
            // 권한/방 상태 검증 (이미 CLOSED 상태도 검증함)
            Chatroom room = chatroomService.validateWritable(userId, req.getChatroomId());

            // 메시지 처리 (멱등성 보장)
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

            // 채팅방 구독자들에게 메시지 브로드캐스트
            WsMessagePush push = WsMessagePush.builder()
                    .messageId(msg.getId())
                    .chatroomId(room.getId())
                    .senderId(userId)
                    .type(MessageType.TEXT)
                    .content(msg.getContent())
                    .createdAt(ts)
                    .build();
            messagingTemplate.convertAndSend("/sub/chatroom." + room.getId(), push);

            // 보낸 사람에게 ACK
            WsSendAckResponse ack = WsSendAckResponse.builder()
                    .clientMessageId(req.getClientMessageId())
                    .messageId(msg.getId())
                    .status("OK")
                    .createdAt(ts)
                    .build();
            messagingTemplate.convertAndSendToUser(userNameKey, "/queue/chat.ack", ack);

            // 상대방에게 채팅 알림 전송
            Long partnerId = room.getUser1Id().equals(userId) ? room.getUser2Id() : room.getUser1Id();

            // 상대방이 현재 채팅방에 있는지 확인
            boolean isInChatroom = userSessionService.isUserInChatroom(partnerId, room.getId());

            if (!isInChatroom) {
                User sender = userRepository.findById(userId)
                        .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));

                notificationService.createChatNotification(
                        partnerId,
                        NotificationType.CHAT,
                        sender.getName() + " 님에게 새로운 메시지가 도착했습니다.",
                        sender.getName(),
                        userId,
                        room.getId()
                );
            }

        } catch (Exception e) {

        }
    }
}