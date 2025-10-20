package com.unimate.domain.match.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.unimate.domain.match.entity.MatchStatus;
import com.unimate.domain.match.entity.MatchType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
        private String senderName;
        private Long receiverId;
        private String receiverName;
        private MatchType matchType;
        private MatchStatus matchStatus;
        private BigDecimal preferenceScore;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime confirmedAt;
    }
}