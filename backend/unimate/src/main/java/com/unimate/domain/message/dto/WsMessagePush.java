package com.unimate.domain.message.dto;

import lombok.*;

@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class WsMessagePush {
    private Long messageId;
    private Long chatroomId;
    private Long senderId;
    private MessageType type;   // TEXT
    private String content;
    private String createdAt;   // ISO_LOCAL_DATE_TIME
}
