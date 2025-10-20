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
public class MatchListResponse {
    private List<MatchListItem> matches;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatchListItem {
        private Long id;
        private Long senderId;
        private Long receiverId;
        private MatchType matchType;
        private MatchStatus matchStatus;
        private BigDecimal preferenceScore;
        private LocalDateTime confirmedAt;
        private String message; // 매칭 상태 메시지

        private SenderInfo sender;   // 발신자 정보
        private ReceiverInfo receiver; // 수신자 정보

        @Getter
        @NoArgsConstructor
        @AllArgsConstructor
        @Builder
        public static class SenderInfo {
            private Long id;
            private String name;
            private String email;
            private String university;
        }

        @Getter
        @NoArgsConstructor
        @AllArgsConstructor
        @Builder
        public static class ReceiverInfo {
            private Long id;
            private String name;
            private Integer age;
            private String university;
            private String email;
        }
    }
}