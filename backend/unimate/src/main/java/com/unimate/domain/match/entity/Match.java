package com.unimate.domain.match.entity;

import com.unimate.domain.user.user.entity.User;
import com.unimate.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
// TODO: 후기(Review) 연동 시 재매칭 기능을 허용하기 위해
// rematch_round 컬럼 활성화 및 유니크 제약 조건 확장 예정
// 현재는 단일 매칭만 허용 (동일 조합 중복 금지)
@Table(
        name = "matches",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_match_sender_receiver",
                columnNames = {"sender_id", "receiver_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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
    @Column(name = "match_type", length = 10, nullable = false)
    private MatchType matchType = MatchType.LIKE;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_status", length = 10, nullable = false)
    private MatchStatus matchStatus = MatchStatus.PENDING;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "1.0")
    @Column(name = "preference_score", precision = 3, scale = 2, nullable = false)
    private BigDecimal preferenceScore = BigDecimal.ZERO;

    // 매칭 확정 시점
    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    // 재매칭 회차 (현재 미사용, 향후 후기 시스템과 연계 시 활용)
    // @Column(name = "rematch_round", nullable = false)
    // @Builder.Default
    // private Integer rematchRound = 0;

    @Builder
    public Match(User sender, User receiver, MatchType matchType, MatchStatus matchStatus, BigDecimal preferenceScore) {
        this.sender = sender;
        this.receiver = receiver;
        this.matchType = matchType;
        this.matchStatus = matchStatus;
        this.preferenceScore = preferenceScore != null ? preferenceScore : BigDecimal.ZERO;
    }

    public void upgradeToRequest(User requestSender, User requestReceiver) {
        this.sender = requestSender;
        this.receiver = requestReceiver;
        this.matchType = MatchType.REQUEST;
        // status는 PENDING으로 유지
    }

    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }

    // 재매칭 회차 설정 메서드
    //  public void setRematchRound(Integer rematchRound) {
    //      this.rematchRound = rematchRound;
    //  }
}
