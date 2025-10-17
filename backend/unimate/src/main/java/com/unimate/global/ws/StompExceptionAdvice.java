package com.unimate.global.ws;

import com.unimate.domain.message.dto.WsError;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.access.AccessDeniedException;

import java.security.Principal;

@Controller // 또는 @ControllerAdvice
public class StompExceptionAdvice {

    @MessageExceptionHandler(ResponseStatusException.class)
    @SendToUser("/queue/chat.errors")
    public WsError handleRse(ResponseStatusException ex, Principal p) {
        return WsError.builder()
                .code(ex.getStatusCode().toString())
                .message(ex.getReason() != null ? ex.getReason() : "요청 처리 중 오류가 발생했습니다.")
                .detail(ex.getClass().getSimpleName())
                .build();
    }

    @MessageExceptionHandler(AccessDeniedException.class)
    @SendToUser("/queue/chat.errors")
    public WsError handleDenied(AccessDeniedException ex, Principal p) {
        return WsError.builder()
                .code("FORBIDDEN")
                .message("권한이 없습니다.")
                .detail(ex.getMessage())
                .build();
    }

    @MessageExceptionHandler(Exception.class)
    @SendToUser("/queue/chat.errors")
    public WsError handleAny(Exception ex, Principal p) {
        return WsError.builder()
                .code("INTERNAL_ERROR")
                .message("알 수 없는 오류가 발생했습니다.")
                .detail(ex.getClass().getSimpleName())
                .build();
    }
}
