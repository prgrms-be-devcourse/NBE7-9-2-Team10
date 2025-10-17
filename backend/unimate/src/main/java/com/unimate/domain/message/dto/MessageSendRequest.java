package com.unimate.domain.message.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class MessageSendRequest {
    @NotBlank private String content;
    @NotBlank private String clientMessageId; // 멱등키
}
