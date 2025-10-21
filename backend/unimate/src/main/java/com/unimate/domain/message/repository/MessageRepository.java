package com.unimate.domain.message.repository;

import com.unimate.domain.message.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Optional<Message> findTopByChatroom_IdOrderByIdDesc(Long chatroomId);

    long countByChatroom_Id(Long chatroomId);
    long countByChatroom_IdAndIdGreaterThan(Long chatroomId, Long lastReadId);

    List<Message> findByChatroom_IdOrderByIdDesc(Long chatroomId, Pageable pageable);
    List<Message> findByChatroom_IdAndIdLessThanOrderByIdDesc(Long chatroomId, Long cursorMessageId, Pageable pageable);

    boolean existsByIdAndChatroom_Id(Long id, Long chatroomId);

    Page<Message> findByChatroomId(Long chatroomId, Pageable pageable);

    // 멱등 처리용
    Optional<Message> findByChatroom_IdAndSenderIdAndClientMessageId(Long chatroomId, Long senderId, String clientMessageId);
}
