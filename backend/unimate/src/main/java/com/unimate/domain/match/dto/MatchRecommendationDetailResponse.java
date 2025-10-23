package com.unimate.domain.match.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.unimate.domain.match.entity.MatchStatus;
import com.unimate.domain.match.entity.MatchType;
import com.unimate.domain.user.user.entity.Gender;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchRecommendationDetailResponse {
    private Long receiverId;
    private String email;  // 신고 기능을 위한 이메일 추가
    private String name;
    private String university;
    private Boolean studentVerified;
    private String mbti;
    private Gender gender;
    private Integer age;

    private Boolean isSmoker;
    private Boolean isPetAllowed;
    private Boolean isSnoring;

    private Integer sleepTime;
    private Integer cleaningFrequency;
    private Integer hygieneLevel;
    private Integer noiseSensitivity;
    private Integer drinkingFrequency;
    private Integer guestFrequency;
    private Integer preferredAgeGap;

    private LocalDate birthDate;
    private LocalDate startUseDate;
    private LocalDate endUseDate;

    private BigDecimal preferenceScore;
    private MatchType matchType;
    private MatchStatus matchStatus;
}
