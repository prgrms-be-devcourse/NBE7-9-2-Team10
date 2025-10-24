package com.unimate.domain.chatroom.repository;

import com.unimate.domain.chatroom.entity.Chatroom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatroomRepository
        extends JpaRepository<Chatroom, Long>, CustomChatroomRepository {

    // 멱등성 체크/재조회 (smaller, larger 쌍)
    boolean existsBySmallerUserIdAndLargerUserId(Long smallerUserId, Long largerUserId);
    Optional<Chatroom> findBySmallerUserIdAndLargerUserId(Long smallerUserId, Long largerUserId);

    // 목록(오프셋 페이징, 최신순) — MVP 용도
    Page<Chatroom> findByUser1IdOrUser2IdOrderByLastMessageAtDesc(Long user1Id, Long user2Id, Pageable pageable);

    // 개별 사용자 상태에 따른 활성 채팅방 조회
    @Query("SELECT c FROM Chatroom c WHERE " +
            "(c.user1Id = :userId AND c.user1Status = 'ACTIVE') OR " +
            "(c.user2Id = :userId AND c.user2Status = 'ACTIVE')")
    List<Chatroom> findActiveRoomsByUser(@Param("userId") Long userId);
}


