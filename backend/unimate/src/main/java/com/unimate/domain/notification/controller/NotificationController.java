package com.unimate.domain.notification.controller;

import com.unimate.domain.notification.entity.Notification;
import com.unimate.domain.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "NotificationController", description = "알림 API")
@SecurityRequirement(name = "BearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    // 알림 목록 조회
    @GetMapping
    @Operation(summary = "알림 목록 조회")
    public ResponseEntity<Page<Notification>> getNotifications(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable) {

        Long userId = Long.valueOf(authentication.getName());
        Page<Notification> notifications = notificationService.getUserNotifications(userId, pageable);

        return ResponseEntity.ok(notifications);
    }

    // 읽지 않은 알림 개수 조회
    @GetMapping("/unread-count")
    @Operation(summary = "읽지 않은 알림 개수 조회")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        long unreadCount = notificationService.getUnreadCount(userId);

        return ResponseEntity.ok(unreadCount);
    }

    // 알림 읽음 처리
    @PutMapping("/{id}/read")
    @Operation(summary = "알림 읽음 처리")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId = Long.valueOf(authentication.getName());
        notificationService.markAsRead(id, userId);

        return ResponseEntity.ok().build();
    }

    // 알림 삭제
    @DeleteMapping("/{id}")
    @Operation(summary = "알림 삭제")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId = Long.valueOf(authentication.getName());
        notificationService.deleteNotification(id, userId);

        return ResponseEntity.ok().build();
    }
}