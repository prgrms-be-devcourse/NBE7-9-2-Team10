package com.unimate.domain.match.entity;

import com.unimate.domain.user.user.entity.User;
import com.unimate.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "match_table")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Match extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id")
    private User receiver;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_type")
    private MatchType matchType;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_status")
    private MatchStatus matchStatus;

    @Column(name = "preference_score", precision = 5, scale = 4)
    private BigDecimal preferenceScore;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Builder
    public Match(User sender, User receiver, MatchType matchType, MatchStatus matchStatus) {
        this.sender = sender;
        this.receiver = receiver;
        this.matchType = matchType;
        this.matchStatus = matchStatus;
    }

    public void upgradeToRequest(User requestSender, User requestReceiver) {
        this.sender = requestSender;
        this.receiver = requestReceiver;
        this.matchType = MatchType.REQUEST;
        // status는 PENDING으로 유지
    }
}
