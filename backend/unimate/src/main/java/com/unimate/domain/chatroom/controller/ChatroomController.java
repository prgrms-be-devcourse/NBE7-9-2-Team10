package com.unimate.domain.chatroom.controller;

import com.unimate.domain.chatroom.dto.*;
import com.unimate.domain.chatroom.entity.ChatroomStatus;
import com.unimate.domain.chatroom.service.ChatroomService;
import com.unimate.global.jwt.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chatrooms")
@RequiredArgsConstructor
@Validated
@Tag(name = "ChatroomController", description = "채팅방 API")
@SecurityRequirement(name = "BearerAuth")
public class ChatroomController {

    private final ChatroomService chatroomService;

    /** 방 생성(멱등) */
    @PostMapping
    @Operation(summary = "채팅방 생성")
    public ResponseEntity<ChatRoomCreateResponse> create(
            @AuthenticationPrincipal CustomUserPrincipal me,
            @Valid @RequestBody ChatRoomCreateRequest req
    ) {
        ChatRoomCreateResponse res = chatroomService.createIfNotExists(me.getUserId(), req.getPartnerId());
        return ResponseEntity.ok(res);
    }

    /** 방 상세 */
    @GetMapping("/{chatroomId}")
    @Operation(summary = "채팅방 상세 조회")
    public ResponseEntity<ChatRoomDetailResponse> detail(
            @AuthenticationPrincipal CustomUserPrincipal me,
            @PathVariable Long chatroomId
    ) {
        ChatRoomDetailResponse res = chatroomService.getDetail(me.getUserId(), chatroomId);
        return ResponseEntity.ok(res);
    }

    /** 내 방 목록(커서 페이지네이션) */
    @GetMapping
    @Operation(summary = "채팅방 목록 조회")
    public ResponseEntity<ChatRoomListResponse> list(
            @AuthenticationPrincipal CustomUserPrincipal me,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "30") @Min(1) @Max(100) int limit,
            @RequestParam(required = false) ChatroomStatus status // 잘못된 값이면 400 자동
    ) {
        ChatRoomListResponse res = chatroomService.listMyRooms(me.getUserId(), cursor, limit, status);
        return ResponseEntity.ok(res);
    }

    /** 메시지 히스토리 조회 (보조 REST) */
    @GetMapping("/{chatroomId}/messages")
    @Operation(summary = "채팅방 메세지 조회")
    public ResponseEntity<ChatHistoryResponse> history(
            @AuthenticationPrincipal CustomUserPrincipal me,
            @PathVariable Long chatroomId,
            @RequestParam(defaultValue = "30") @Min(1) @Max(100) int limit,
            @RequestParam(required = false) Long beforeMessageId
    ) {
        // 서비스 시그니처와 순서 일치: (me, chatroomId, beforeMessageId, limit)
        ChatHistoryResponse res = chatroomService.getHistory(
                me.getUserId(), chatroomId, beforeMessageId, limit
        );
        return ResponseEntity.ok(res);
    }

    /** 읽음 처리 */
    @PostMapping("/{chatroomId}/read")
    @Operation(summary = "채팅방 메세지 읽음")
    public ResponseEntity<ChatReadResponse> read(
            @AuthenticationPrincipal CustomUserPrincipal me,
            @PathVariable Long chatroomId,
            @Valid @RequestBody ChatReadRequest req
    ) {
        ChatReadResponse res = chatroomService.updateLastRead(
                me.getUserId(), chatroomId, req.getLastReadMessageId()
        );
        return ResponseEntity.ok(res);
    }

    /** 나가기 (응답 바디 있음) */
    @PostMapping("/{chatroomId}/leave")
    @Operation(summary = "채팅방 나가기")
    public ResponseEntity<ChatRoomLeaveResponse> leave(
            @AuthenticationPrincipal CustomUserPrincipal me,
            @PathVariable Long chatroomId
    ) {
        ChatRoomLeaveResponse res = chatroomService.leave(me.getUserId(), chatroomId);
        return ResponseEntity.ok(res);
    }

    /** 차단 (응답 바디 없음) */
    //@PostMapping("/{chatroomId}/block")
    //@Operation(summary = "채팅방 상대방 차단")
    //public ResponseEntity<Void> block(
    //        @AuthenticationPrincipal CustomUserPrincipal me,
    //        @PathVariable Long chatroomId
    //) {
    //    chatroomService.block(me.getUserId(), chatroomId);
    //    return ResponseEntity.noContent().build();
    //}
}
