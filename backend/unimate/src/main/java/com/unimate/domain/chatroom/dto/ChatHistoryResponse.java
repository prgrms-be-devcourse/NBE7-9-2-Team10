package com.unimate.domain.chatroom.dto;

import lombok.*;
import java.util.List;

@Getter @NoArgsConstructor @AllArgsConstructor
public class ChatHistoryResponse {
    private List<ChatMessageItem> items;
    private String nextCursor; // 커서(없으면 null)

    @Getter @NoArgsConstructor @AllArgsConstructor
    public static class ChatMessageItem {
        private Long messageId;
        private Long chatroomId;
        private Long senderId;
        private String content;     // 텍스트만
        private String createdAt;   // ISO_LOCAL_DATE_TIME
    }
}
