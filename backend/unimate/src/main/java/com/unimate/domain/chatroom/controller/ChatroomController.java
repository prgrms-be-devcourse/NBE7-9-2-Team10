package com.unimate.domain.chatroom.controller;

import com.unimate.domain.chatroom.dto.*;
import com.unimate.domain.chatroom.entity.ChatroomStatus;
import com.unimate.domain.chatroom.service.ChatroomService;
import com.unimate.domain.chatroom.service.UserSessionService;
import com.unimate.global.jwt.CustomUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/chatrooms")
public class ChatroomController {

    private final ChatroomService chatroomService;
    private final UserSessionService userSessionService; // 추가

    /** 생성 (멱등) */
    @PostMapping
    public ResponseEntity<ChatRoomCreateResponse> create(
            @AuthenticationPrincipal CustomUserPrincipal me,
            @RequestBody ChatRoomCreateRequest req
    ) {
        ChatRoomCreateResponse res = chatroomService.createIfNotExists(me.getUserId(), req.getPartnerId());
        return ResponseEntity.ok(res);
    }

    /** 상세 */
    @GetMapping("/{chatroomId}")
    public ResponseEntity<ChatRoomDetailResponse> getDetail(
            @AuthenticationPrincipal CustomUserPrincipal me,
            @PathVariable Long chatroomId
    ) {
        ChatRoomDetailResponse res = chatroomService.getDetail(me.getUserId(), chatroomId);
        return ResponseEntity.ok(res);
    }

    /** 내 방 목록 */
    @GetMapping
    public ResponseEntity<ChatRoomListResponse> listMyRooms(
            @AuthenticationPrincipal CustomUserPrincipal me,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) ChatroomStatus status
    ) {
        ChatRoomListResponse res = chatroomService.listMyRooms(me.getUserId(), cursor, limit, status);
        return ResponseEntity.ok(res);
    }

    /** 메시지 히스토리 */
    @GetMapping("/{chatroomId}/messages")
    public ResponseEntity<ChatHistoryResponse> getHistory(
            @AuthenticationPrincipal CustomUserPrincipal me,
            @PathVariable Long chatroomId,
            @RequestParam(required = false) Long beforeMessageId,
            @RequestParam(defaultValue = "20") int limit
    ) {
        ChatHistoryResponse res = chatroomService.getHistory(me.getUserId(), chatroomId, beforeMessageId, limit);
        return ResponseEntity.ok(res);
    }

    /** 읽음 처리 */
    @PostMapping("/{chatroomId}/read")
    public ResponseEntity<ChatReadResponse> updateLastRead(
            @AuthenticationPrincipal CustomUserPrincipal me,
            @PathVariable Long chatroomId,
            @RequestBody ChatReadRequest req
    ) {
        ChatReadResponse res = chatroomService.updateLastRead(me.getUserId(), chatroomId, req.getLastReadMessageId());
        return ResponseEntity.ok(res);
    }

    /** 나가기 (응답 바디 있음) */
    @PostMapping("/{chatroomId}/leave")
    public ResponseEntity<ChatRoomLeaveResponse> leave(
            @AuthenticationPrincipal CustomUserPrincipal me,
            @PathVariable Long chatroomId
    ) {
        ChatRoomLeaveResponse res = chatroomService.leave(me.getUserId(), chatroomId);
        return ResponseEntity.ok(res);
    }

    /** 채팅방 퇴장 (세션만 제거) */
    @PostMapping("/{chatroomId}/exit")
    public ResponseEntity<Void> exitChatroom(
            @AuthenticationPrincipal CustomUserPrincipal me,
            @PathVariable Long chatroomId
    ) {
        // 사용자가 특정 채팅방에서 나갔음을 기록
        userSessionService.leaveChatroom(me.getUserId(), chatroomId);
        return ResponseEntity.ok().build();
    }

    /**차단 (응답 바디 없음) */
    //@PostMapping("/{chatroomId}/block")
    //public ResponseEntity<Void> block(
    //        @AuthenticationPrincipal CustomUserPrincipal me,
    //        @PathVariable Long chatroomId
    //) {
    //    chatroomService.block(me.getUserId(), chatroomId);
    //    return ResponseEntity.ok().build();
    //}
}