package com.unimate.domain.match.dto;

import com.unimate.domain.match.entity.MatchStatus;
import com.unimate.domain.match.entity.MatchType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchStatusResponse {
    private List<MatchStatusItem> matches;   // 모든 매칭 목록
    private SummaryInfo summary;             // 요약 정보

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatchStatusItem {
        private Long id;
        private Long senderId;
        private Long receiverId;
        private MatchType matchType;
        private MatchStatus matchStatus;
        private BigDecimal preferenceScore;
        private LocalDateTime createdAt;
        private LocalDateTime confirmedAt;
        private String message; // 상태별 메시지

        private PartnerInfo partner;  // 상대방 정보

        @Getter
        @NoArgsConstructor
        @AllArgsConstructor
        @Builder
        public static class PartnerInfo {
            private Long id;
            private String name;
            private String email;
            private String university;
        }
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummaryInfo {
        private int total;     // 전체 매칭 수
        private int pending;   // 대기 중인 매칭 수
        private int accepted;  // 수락된 매칭 수
        private int rejected;  // 거절된 매칭 수
    }
}
