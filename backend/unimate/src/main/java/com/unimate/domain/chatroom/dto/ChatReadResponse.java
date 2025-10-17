package com.unimate.domain.chatroom.dto;

import lombok.*;

@Getter @NoArgsConstructor @AllArgsConstructor
public class ChatReadResponse {
    private Long chatroomId;
    private Long userId;             // 읽음 갱신한 사용자
    private Long lastReadMessageId;
    private String updatedAt;        // ISO_LOCAL_DATE_TIME
}
