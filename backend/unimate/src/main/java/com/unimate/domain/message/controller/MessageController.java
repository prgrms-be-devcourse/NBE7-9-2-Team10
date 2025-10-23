package com.unimate.domain.message.controller;

import com.unimate.domain.message.dto.MessageSendRequest;
import com.unimate.domain.message.dto.MessageSendResponse;
import com.unimate.domain.message.service.MessageService;
import com.unimate.global.jwt.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chatrooms/{chatroomId}/messages")
@RequiredArgsConstructor
@Validated
@Tag(name = "MessageController", description = "채팅방 메세지 API")
@SecurityRequirement(name = "BearerAuth")
public class MessageController {

    private final MessageService messageService;

    /**
     * 메시지 전송 (REST 보조)
     * POST /api/v1/chatrooms/{chatroomId}/messages
     */
    @PostMapping
    @Operation(summary = "채팅방 메시지 전송")
    public ResponseEntity<MessageSendResponse> send(
            @AuthenticationPrincipal CustomUserPrincipal me,
            @PathVariable Long chatroomId,
            @Valid @RequestBody MessageSendRequest req
    ) {
        MessageSendResponse res = messageService.sendText(
                me.getUserId(), chatroomId, req.getContent(), req.getClientMessageId()
        );
        return ResponseEntity.ok(res);
    }
}