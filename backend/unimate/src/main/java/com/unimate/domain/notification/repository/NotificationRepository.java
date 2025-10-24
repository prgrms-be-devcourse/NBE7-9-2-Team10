package com.unimate.domain.notification.repository;


import com.unimate.domain.notification.entity.Notification;
import com.unimate.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 사용자의 모든 알림 조회 (최신순)
    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    // 사용자의 읽지 않은 알림 개수
    long countByUserAndIsReadFalse(User user);

    // 사용자의 읽지 않은 알림 조회
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    // 특정 사용자의 알림 삭제
    void deleteByUser(User user);
}