package com.unimate.domain.message.dto;

import lombok.*;

@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class WsErrorPayload {
    private String code;
    private String message;
    private String detail;   // optional
}
