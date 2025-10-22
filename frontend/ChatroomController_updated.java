package com.unimate.domain.chatroom.controller;

import com.unimate.domain.chatroom.dto.*;
import com.unimate.domain.chatroom.service.ChatroomService;
import com.unimate.domain.user.service.UserSessionService;
import com.unimate.global.auth.AuthUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chatrooms")
@RequiredArgsConstructor
public class ChatroomController {

    private final ChatroomService chatroomService;
    private final UserSessionService userSessionService; // 추가

    // 채팅방 상세 조회 (수정됨)
    @GetMapping("/{chatroomId}")
    public ResponseEntity<ChatRoomDetailResponse> getDetail(
            @AuthUser Long me,
            @PathVariable Long chatroomId) {
        
        // 사용자가 채팅방에 들어왔음을 기록
        userSessionService.enterChatroom(me, chatroomId);
        
        ChatRoomDetailResponse response = chatroomService.getDetail(me, chatroomId);
        return ResponseEntity.ok(response);
    }

    // 채팅방 목록 조회
    @GetMapping
    public ResponseEntity<ChatRoomListResponse> listMyRooms(
            @AuthUser Long me,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String status) {
        
        ChatRoomListResponse response = chatroomService.listMyRooms(me, cursor, limit, status);
        return ResponseEntity.ok(response);
    }

    // 채팅방 생성
    @PostMapping
    public ResponseEntity<ChatRoomCreateResponse> create(
            @AuthUser Long me,
            @RequestBody ChatRoomCreateRequest request) {
        
        ChatRoomCreateResponse response = chatroomService.createIfNotExists(me, request.getPartnerId());
        return ResponseEntity.ok(response);
    }

    // 채팅 히스토리 조회
    @GetMapping("/{chatroomId}/messages")
    public ResponseEntity<ChatHistoryResponse> getHistory(
            @AuthUser Long me,
            @PathVariable Long chatroomId,
            @RequestParam(required = false) Long beforeMessageId,
            @RequestParam(defaultValue = "50") int limit) {
        
        ChatHistoryResponse response = chatroomService.getHistory(me, chatroomId, beforeMessageId, limit);
        return ResponseEntity.ok(response);
    }

    // 읽음 처리
    @PostMapping("/{chatroomId}/read")
    public ResponseEntity<ChatReadResponse> updateLastRead(
            @AuthUser Long me,
            @PathVariable Long chatroomId,
            @RequestBody ChatReadRequest request) {
        
        ChatReadResponse response = chatroomService.updateLastRead(me, chatroomId, request.getLastReadMessageId());
        return ResponseEntity.ok(response);
    }

    // 채팅방 나가기
    @PostMapping("/{chatroomId}/leave")
    public ResponseEntity<ChatRoomLeaveResponse> leave(
            @AuthUser Long me,
            @PathVariable Long chatroomId) {
        
        // 사용자가 채팅방에서 나갔음을 기록
        userSessionService.leaveChatroom(me);
        
        ChatRoomLeaveResponse response = chatroomService.leave(me, chatroomId);
        return ResponseEntity.ok(response);
    }
}
