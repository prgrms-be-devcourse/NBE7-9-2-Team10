package com.unimate.domain.chatroom.dto;

import lombok.*;

@Getter @NoArgsConstructor @AllArgsConstructor
public class ChatRoomDetailResponse {
    private Long chatroomId;
    private Long user1Id;
    private Long user2Id;
    private String partnerName;        // 상대방 이름
    private String partnerUniversity;// 상대방 대학교
    private Boolean isPartnerDeleted;  // 상대방이 탈퇴한 사용자인지 여부
    private String status; // ACTIVE | CLOSED
    private String user1Status;
    private String user2Status;
    private String createdAt;
    private String updatedAt;
    private Long lastReadMessageIdUser1;
    private Long lastReadMessageIdUser2;
}
