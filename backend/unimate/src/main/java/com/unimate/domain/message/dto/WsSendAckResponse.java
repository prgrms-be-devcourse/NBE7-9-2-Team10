package com.unimate.domain.message.dto;

import lombok.*;

@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class WsSendAckResponse {
    private String clientMessageId;
    private Long messageId;
    private String status;      // "OK"
    private String createdAt;
}
