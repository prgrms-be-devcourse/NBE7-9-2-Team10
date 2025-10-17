package com.unimate.domain.match.dto;

import com.unimate.domain.match.entity.MatchStatus;
import com.unimate.domain.match.entity.MatchType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MatchResultResponse {
    private List<MatchResultItem> results;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchResultItem {
        private Long id;
        private Long senderId;
        private Long receiverId;
        private MatchType matchType;
        private MatchStatus matchStatus;
        private BigDecimal preferenceScore;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime confirmedAt;
    }
}