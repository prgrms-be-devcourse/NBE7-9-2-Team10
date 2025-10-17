package com.unimate.domain.chatroom.dto;

import lombok.*;

@Getter @NoArgsConstructor @AllArgsConstructor
public class ChatRoomCreateResponse {
    private Long chatroomId;
    private Long user1Id;
    private Long user2Id;
    private String status;
    private String createdAt;
}
