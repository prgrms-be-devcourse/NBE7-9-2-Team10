package com.unimate.domain.match.dto;

import com.unimate.domain.match.entity.MatchStatus;
import com.unimate.domain.match.entity.MatchType;
import com.unimate.domain.user.user.entity.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class MatchRecommendationResponse {
    private List<MatchRecommendationItem> recommendations;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatchRecommendationItem {
        private Long receiverId;
        private String name;
        private String university;
        private Boolean studentVerified;
        private Gender gender;
        private Integer age;
        private String mbti;
        private BigDecimal preferenceScore;
        private MatchType matchType;
        private MatchStatus matchStatus;
    }
}
