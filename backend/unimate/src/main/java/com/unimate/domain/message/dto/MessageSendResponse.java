package com.unimate.domain.message.dto;

import lombok.*;

@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class MessageSendResponse {
    private Long messageId;
    private Long chatroomId;
    private Long senderId;
    private String content;
    private String createdAt; // ISO_LOCAL_DATE_TIME
}
