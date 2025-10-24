package com.unimate.domain.match.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.unimate.domain.user.user.entity.User;
import com.unimate.global.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    // 양방향 응답 추적 (sender와 receiver 각각의 응답 상태)
    @Enumerated(EnumType.STRING)
    @Column(name = "sender_response", length = 10, nullable = false)
    private MatchStatus senderResponse = MatchStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "receiver_response", length = 10, nullable = false)
    private MatchStatus receiverResponse = MatchStatus.PENDING;

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
    @Column(name = "rematch_round", nullable = false)
    private Integer rematchRound = 0;

    @Builder
    public Match(User sender, User receiver, MatchType matchType, MatchStatus matchStatus, BigDecimal preferenceScore) {
        this.sender = sender;
        this.receiver = receiver;
        this.matchType = matchType;
        this.matchStatus = matchStatus;
        this.preferenceScore = preferenceScore != null ? preferenceScore : BigDecimal.ZERO;
        // this.rematchRound = 0; // 항상 0으로 초기화. 프론트 테스트 위해 임시로 넣음.
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

    /**
     * 사용자의 응답 처리 및 최종 상태 결정
     * @param userId 응답하는 사용자 ID
     * @param response 사용자의 응답 (ACCEPTED or REJECTED)
     */
    public void processUserResponse(Long userId, MatchStatus response) {
        if (response != MatchStatus.ACCEPTED && response != MatchStatus.REJECTED) {
            throw new IllegalArgumentException("응답은 ACCEPTED 또는 REJECTED만 가능합니다.");
        }

        // 사용자가 sender인지 receiver인지 판단하여 해당 응답 저장
        if (this.sender.getId().equals(userId)) {
            this.senderResponse = response;
        } else if (this.receiver.getId().equals(userId)) {
            this.receiverResponse = response;
        } else {
            throw new IllegalArgumentException("매칭 참여자가 아닙니다.");
        }

        // 최종 상태 결정 로직
        updateFinalStatus();
    }

    /**
     * 양쪽 응답을 기반으로 최종 매칭 상태 결정
     * - 둘 다 ACCEPTED → 최종 ACCEPTED
     * - 한쪽이라도 REJECTED → 최종 REJECTED
     * - 한쪽이라도 PENDING → 최종 PENDING 유지
     */
    private void updateFinalStatus() {
        if (senderResponse == MatchStatus.REJECTED || receiverResponse == MatchStatus.REJECTED) {
            // 한쪽이라도 거절하면 매칭 거절
            this.matchStatus = MatchStatus.REJECTED;
            this.confirmedAt = LocalDateTime.now();
        } else if (senderResponse == MatchStatus.ACCEPTED && receiverResponse == MatchStatus.ACCEPTED) {
            // 둘 다 수락하면 매칭 확정
            this.matchStatus = MatchStatus.ACCEPTED;
            this.confirmedAt = LocalDateTime.now();
        } else {
            // 아직 한쪽이 응답하지 않았으면 PENDING 유지
            this.matchStatus = MatchStatus.PENDING;
        }
    }

    /**
     * 특정 사용자가 이미 응답했는지 확인
     */
    public boolean hasUserResponded(Long userId) {
        if (this.sender.getId().equals(userId)) {
            return this.senderResponse != MatchStatus.PENDING;
        } else if (this.receiver.getId().equals(userId)) {
            return this.receiverResponse != MatchStatus.PENDING;
        }
        return false;
    }

    /**
     * 특정 사용자의 응답 상태 조회
     */
    public MatchStatus getUserResponse(Long userId) {
        if (this.sender.getId().equals(userId)) {
            return this.senderResponse;
        } else if (this.receiver.getId().equals(userId)) {
            return this.receiverResponse;
        }
        return MatchStatus.PENDING;
    }

    // 재매칭 회차 설정 메서드
    //  public void setRematchRound(Integer rematchRound) {
    //      this.rematchRound = rematchRound;
    //  }
}