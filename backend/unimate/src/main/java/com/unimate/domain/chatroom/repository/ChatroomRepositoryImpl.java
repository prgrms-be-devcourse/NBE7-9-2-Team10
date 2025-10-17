package com.unimate.domain.chatroom.repository;

import com.unimate.domain.chatroom.entity.Chatroom;
import com.unimate.domain.chatroom.entity.ChatroomStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public class ChatroomRepositoryImpl implements CustomChatroomRepository {

    @PersistenceContext
    private EntityManager em;

    @Override
    public List<Chatroom> findRoomsByUserWithCursor(Long userId,
                                                    ChatroomStatus status,
                                                    LocalDateTime cursor,
                                                    int limit) {
        StringBuilder jpql = new StringBuilder("""
            select c
              from Chatroom c
             where (c.user1Id = :userId or c.user2Id = :userId)
        """);

        if (status != null) {
            jpql.append(" and c.status = :status");
        }
        if (cursor != null) {
            // lastMessageAt이 null이면 createdAt을 사용해 커서 비교
            jpql.append(" and coalesce(c.lastMessageAt, c.createdAt) < :cursor");
        }
        jpql.append(" order by coalesce(c.lastMessageAt, c.createdAt) desc");

        var q = em.createQuery(jpql.toString(), Chatroom.class)
                .setParameter("userId", userId)
                .setMaxResults(limit);

        if (status != null) q.setParameter("status", status);
        if (cursor != null) q.setParameter("cursor", cursor);

        return q.getResultList();
    }
}
