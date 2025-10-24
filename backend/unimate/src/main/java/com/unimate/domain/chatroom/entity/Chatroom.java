package com.unimate.domain.chatroom.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Table(
        name = "chatroom",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_chatroom_pair", columnNames = {"smaller_user_id", "larger_user_id"})
        },
        indexes = {
                @Index(name = "idx_chatroom_user1", columnList = "user1_id"),
                @Index(name = "idx_chatroom_user2", columnList = "user2_id"),
                @Index(name = "idx_chatroom_last_at", columnList = "last_message_at DESC")
        }
)
public class Chatroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user1_id", nullable = false)
    private Long user1Id;

    @Column(name = "user2_id", nullable = false)
    private Long user2Id;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    @Builder.Default
    private ChatroomStatus status = ChatroomStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "user1_status", nullable = false, length = 10)
    @Builder.Default
    private ChatroomStatus user1Status = ChatroomStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "user2_status", nullable = false, length = 10)
    @Builder.Default
    private ChatroomStatus user2Status = ChatroomStatus.ACTIVE;

    @Column(name = "last_read_message_id_user1")
    private Long lastReadMessageIdUser1;

    @Column(name = "last_read_message_id_user2")
    private Long lastReadMessageIdUser2;

    // H2/MySQL에서 생성 컬럼로 운용하려면 columnDefinition 사용 (dev H2도 지원)
    @Column(
            name = "smaller_user_id",
            insertable = false, updatable = false,
            columnDefinition = "BIGINT GENERATED ALWAYS AS (LEAST(user1_id, user2_id))"
    )
    private Long smallerUserId;

    @Column(
            name = "larger_user_id",
            insertable = false, updatable = false,
            columnDefinition = "BIGINT GENERATED ALWAYS AS (GREATEST(user1_id, user2_id))"
    )
    private Long largerUserId;

    @Column(name = "last_message_id")
    private Long lastMessageId;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "blocked_by")
    private Long blockedBy;

    @Column(name = "blocked_at")
    private LocalDateTime blockedAt;

    @Column(name = "created_at", nullable = false, updatable = false,
            columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false,
            columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;

    //@Version
    //private Long version;

    public void block(Long byUserId) {
        this.status = ChatroomStatus.CLOSED;
        this.blockedBy = byUserId;
        this.blockedAt = LocalDateTime.now();
    }

    public void leave(Long userId) {
        if (userId.equals(user1Id)) {
            this.user1Status = ChatroomStatus.CLOSED;
        } else if (userId.equals(user2Id)) {
            this.user2Status = ChatroomStatus.CLOSED;
        }
    }

    // CLOSED 상태의 채팅방을 다시 활성화
    public void reactivate() {
        this.status = ChatroomStatus.ACTIVE;
        this.user1Status = ChatroomStatus.ACTIVE;
        this.user2Status = ChatroomStatus.ACTIVE;
        this.blockedBy = null;
        this.blockedAt = null;
    }

    public void updateLastRead(Long userId, Long messageId) {
        if (userId.equals(user1Id)) {
            this.lastReadMessageIdUser1 = messageId;
        } else if (userId.equals(user2Id)) {
            this.lastReadMessageIdUser2 = messageId;
        }
    }

    public void bumpLastMessage(Long messageId, LocalDateTime sentAt) {
        this.lastMessageId = messageId;
        this.lastMessageAt = sentAt;
    }

    public static Chatroom create(Long user1Id, Long user2Id) {
        if (user1Id.equals(user2Id)) {
            throw new IllegalArgumentException("Self chat is not allowed.");
        }
        return Chatroom.builder()
                .user1Id(user1Id)
                .user2Id(user2Id)
                .status(ChatroomStatus.ACTIVE)
                .user1Status(ChatroomStatus.ACTIVE)
                .user2Status(ChatroomStatus.ACTIVE)
                .build();
    }

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
