package com.unimate.domain.message.dto;

import lombok.Builder;
import lombok.Value;

@Value @Builder
public class WsError {
    String code;
    String message;   // 사용자 메시지
    String detail;
}
