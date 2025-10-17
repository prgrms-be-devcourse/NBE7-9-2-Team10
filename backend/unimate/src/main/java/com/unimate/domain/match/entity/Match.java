package com.unimate.domain.match.entity;

import com.unimate.domain.user.user.entity.User;
import com.unimate.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "matches",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_match_sender_receiver_round",
                columnNames = {"sender_id", "receiver_id", "rematch_round"}
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Match extends BaseEntity {

    // 사용자 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_match_sender"))
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_match_receiver"))
    private User receiver;

    // 매칭 타입 / 상태
    @Enumerated(EnumType.STRING)
    @Column(name = "match_type", length = 20, nullable = false)
    @Builder.Default
    private MatchType matchType = MatchType.LIKE;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_status", length = 20, nullable = false)
    @Builder.Default
    private MatchStatus matchStatus = MatchStatus.PENDING;

    @DecimalMin(value = "0.0", inclusive = true)
    @DecimalMax(value = "1.0", inclusive = true)
    @Column(name = "preference_score", precision = 3, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal preferenceScore = BigDecimal.ZERO;

    // 매칭 확정 시점 (ACCEPTED or REJECTED)
    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    // 재매칭 회차
    @Column(name = "rematch_round", nullable = false)
    @Builder.Default
    private Integer rematchRound = 1;

    @Builder
    public Match(User sender, User receiver, MatchType matchType, MatchStatus matchStatus) {
        this.sender = sender;
        this.receiver = receiver;
        this.matchType = matchType;
        this.matchStatus = matchStatus;
    }
}
