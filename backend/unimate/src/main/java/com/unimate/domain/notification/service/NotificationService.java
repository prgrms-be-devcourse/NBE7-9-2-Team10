package com.unimate.domain.notification.service;


import com.unimate.domain.notification.entity.Notification;
import com.unimate.domain.notification.entity.NotificationType;
import com.unimate.domain.notification.repository.NotificationRepository;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;

import java.util.Map;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // 알림 생성
    @Transactional
    public void createNotification(Long userId, NotificationType type,
                                   String message, String senderName, Long senderId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ServiceException.notFound("사용자를 찾을 수 없습니다."));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .message(message)
                .senderName(senderName)
                .senderId(senderId)
                .build();

        notificationRepository.save(notification);
        sendWebSocketNotification(notification);
    }

    // 채팅방 관련 알림 생성
    @Transactional
    public void createChatNotification(Long userId, NotificationType type,
                                       String message, String senderName, Long senderId, Long chatroomId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ServiceException.notFound("사용자를 찾을 수 없습니다."));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .message(message)
                .senderName(senderName)
                .senderId(senderId)
                .chatroomId(chatroomId)
                .build();

        notificationRepository.save(notification);
        sendWebSocketNotification(notification);
    }

    private void sendWebSocketNotification(Notification notification) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("id", notification.getId());
            payload.put("type", notification.getType().toString());
            payload.put("message", notification.getMessage());
            payload.put("senderName", notification.getSenderName());
            payload.put("senderId", notification.getSenderId());
            payload.put("chatroomId", notification.getChatroomId());
            payload.put("isRead", notification.isRead());
            payload.put("createdAt", notification.getCreatedAt().toString());

            messagingTemplate.convertAndSendToUser(
                    notification.getUser().getId().toString(),
                    "/queue/notifications",
                    payload
            );
        } catch (Exception e) {
            // WebSocket 실패해도 DB에는 저장되어 있으므로 무시
        }
    }

    // 사용자 알림 조회 (페이징)
    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ServiceException.notFound("사용자를 찾을 수 없습니다."));

        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    // 읽지 않은 알림 개수 조회
    public long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ServiceException.notFound("사용자를 찾을 수 없습니다."));

        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    // 알림 읽음 처리
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> ServiceException.notFound("알림을 찾을 수 없습니다."));

        if (!notification.getUser().getId().equals(userId)) {
            throw ServiceException.forbidden("본인의 알림만 읽을 수 있습니다.");
        }

        notification.markAsRead();
    }

    // 알림 삭제
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> ServiceException.notFound("알림을 찾을 수 없습니다."));

        if (!notification.getUser().getId().equals(userId)) {
            throw ServiceException.forbidden("본인의 알림만 삭제할 수 있습니다.");
        }

        notificationRepository.delete(notification);
    }

    /**
     * 발신자 ID를 기준으로 특정 알림을 삭제하는 메서드
     */
    @Transactional
    public void deleteNotificationBySender(Long receiverId, NotificationType type, Long senderId) {
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> ServiceException.notFound("알림 수신자를 찾을 수 없습니다."));
        notificationRepository.deleteByUserAndTypeAndSenderId(receiver, type, senderId);
    }

    /**
     * 발신자 ID를 기준으로 특정 알림이 존재하는지 확인하는 메서드
     */
    public boolean notificationExistsBySender(Long receiverId, NotificationType type, Long senderId) {
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> ServiceException.notFound("알림 수신자를 찾을 수 없습니다."));
        return notificationRepository.findByUserAndTypeAndSenderId(receiver, type, senderId).isPresent();
    }
}