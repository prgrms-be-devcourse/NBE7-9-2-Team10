package com.unimate.domain.match.dto;

import java.math.BigDecimal;
import java.util.List;

import com.unimate.domain.match.entity.MatchStatus;
import com.unimate.domain.match.entity.MatchType;
import com.unimate.domain.user.user.entity.Gender;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
        
        // 추가 프로필 정보 (추천 목록에서 바로 표시)
        private Integer sleepTime;
        private Integer cleaningFrequency;
        private Boolean isSmoker;
        private String startUseDate;  
        private String endUseDate;    
    }
}
