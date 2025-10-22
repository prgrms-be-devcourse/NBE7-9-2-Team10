package com.unimate.domain.chatroom.dto;

import lombok.*;
import java.util.List;

@Getter @NoArgsConstructor @AllArgsConstructor
public class ChatRoomListResponse {
    private List<ChatRoomListItem> items;
    private String nextCursor; // 커서 페이지네이션(없으면 null)

    @Getter @NoArgsConstructor @AllArgsConstructor
    public static class ChatRoomListItem {
        private Long chatroomId;
        private Long partnerId;
        private String partnerName;  // 상대방 이름
        private LastMessageSummary lastMessage; // { messageId, content, createdAt }
        private Long unreadCount;
        private String status;      // ACTIVE | CLOSED
        private String updatedAt;   // ISO_LOCAL_DATE_TIME
    }

    @Getter @NoArgsConstructor @AllArgsConstructor
    public static class LastMessageSummary {
        private Long messageId;
        private String content;
        private String createdAt; // ISO_LOCAL_DATE_TIME
    }
}
