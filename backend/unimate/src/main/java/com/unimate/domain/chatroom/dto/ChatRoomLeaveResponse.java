package com.unimate.domain.chatroom.dto;

import lombok.*;

@Getter @NoArgsConstructor @AllArgsConstructor
public class ChatRoomLeaveResponse {
    private Long chatroomId;
    private String status;    // CLOSED 로 전환
    private String updatedAt; // ISO_LOCAL_DATE_TIME
}
