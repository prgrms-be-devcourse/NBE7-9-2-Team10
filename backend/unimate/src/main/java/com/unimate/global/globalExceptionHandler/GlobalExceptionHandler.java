package com.unimate.global.globalExceptionHandler;

import com.unimate.global.exception.ServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    //비지니스 예외 (ServiceException)
    @ExceptionHandler(ServiceException.class)
    public ResponseEntity<Map<String, Object>> handleServiceException(ServiceException ex) {
        log.warn("[ServiceException] {} - {}", ex.getErrorCode(), ex.getMessage());

        Map<String, Object> body = Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", ex.getStatus().value(),
                "error", ex.getErrorCode(),
                "message", ex.getMessage()
        );

        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    //예상치 못한 시스템 예외 (NullPointerException, SQL 오류 등)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception ex) {
        log.error("[Unexpected Error]", ex);

        Map<String, Object> body = Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", 500,
                "error", "INTERNAL_SERVER_ERROR",
                "message", ex.getMessage()
        );

        return ResponseEntity.internalServerError().body(body);
    }
}

