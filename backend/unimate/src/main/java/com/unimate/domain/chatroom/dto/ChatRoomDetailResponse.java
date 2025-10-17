package com.unimate.domain.chatroom.dto;

import lombok.*;

@Getter @NoArgsConstructor @AllArgsConstructor
public class ChatRoomDetailResponse {
    private Long chatroomId;
    private Long user1Id;
    private Long user2Id;
    private String status; // ACTIVE | CLOSED
    private String createdAt;
    private String updatedAt;
    private Long lastReadMessageIdUser1;
    private Long lastReadMessageIdUser2;
}
