package com.unimate.domain.chatroom.repository;

import com.unimate.domain.chatroom.entity.Chatroom;
import com.unimate.domain.chatroom.entity.ChatroomStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface CustomChatroomRepository {
    // lastMessageAt(없으면 createdAt) 기준 keyset(커서) 페이징
    List<Chatroom> findRoomsByUserWithCursor(Long userId,
                                             ChatroomStatus status,
                                             LocalDateTime cursor,
                                             int limit);
}
