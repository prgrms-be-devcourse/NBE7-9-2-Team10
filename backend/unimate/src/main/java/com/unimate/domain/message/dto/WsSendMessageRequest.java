package com.unimate.domain.message.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class WsSendMessageRequest {
    @NotNull private Long chatroomId;
    @NotBlank private String clientMessageId; // 멱등키
    @NotNull private MessageType type;
    @NotBlank private String content;
}
