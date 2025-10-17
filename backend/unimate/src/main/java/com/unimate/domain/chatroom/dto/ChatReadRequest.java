package com.unimate.domain.chatroom.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter @NoArgsConstructor @AllArgsConstructor
public class ChatReadRequest {
    @NotNull @Positive
    private Long lastReadMessageId;
}
