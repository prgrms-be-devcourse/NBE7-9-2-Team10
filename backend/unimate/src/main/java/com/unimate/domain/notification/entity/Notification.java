package com.unimate.domain.notification.entity;

import com.unimate.domain.user.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 알림을 받을 사용자

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(name = "sender_name", length = 100)
    private String senderName;

    @Column(name = "sender_id")
    private Long senderId;

    @Column(name = "chatroom_id")
    private Long chatroomId; // 채팅방 관련 알림인 경우

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Notification(User user, NotificationType type, String message,
                        String senderName, Long senderId, Long chatroomId) {
        this.user = user;
        this.type = type;
        this.message = message;
        this.senderName = senderName;
        this.senderId = senderId;
        this.chatroomId = chatroomId;
    }

    // 읽음 처리
    public void markAsRead() {
        this.isRead = true;
    }
}