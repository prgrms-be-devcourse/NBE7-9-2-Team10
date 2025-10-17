package com.unimate.domain.message.entity;

import com.unimate.domain.chatroom.entity.Chatroom;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(
        name = "message",
        indexes = {
                @Index(name = "idx_msg_room_id", columnList = "chatroom_id,id")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_msg_idempotent", columnNames = {"chatroom_id", "sender_id", "client_message_id"})
        }
)
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chatroom_id", nullable = false, foreignKey = @ForeignKey(name = "fk_message_chatroom"))
    private Chatroom chatroom;

    @Column(nullable = false)
    private Long senderId;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 멱등키: 클라이언트 생성(UUID 권장)
    @Column(name = "client_message_id", nullable = false, length = 64)
    private String clientMessageId;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}
