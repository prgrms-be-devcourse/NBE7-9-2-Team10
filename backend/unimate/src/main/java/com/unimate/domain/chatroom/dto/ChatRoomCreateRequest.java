package com.unimate.domain.chatroom.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter @NoArgsConstructor @AllArgsConstructor
public class ChatRoomCreateRequest {
    @NotNull @Positive
    private Long partnerId;   // 상대방 ID (me는 토큰에서)
}
