package com.unimate.domain.chatroom.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserSessionService {
    private final ConcurrentHashMap<Long, Long> userActiveChatrooms = new ConcurrentHashMap<>();

    public void enterChatroom(Long userId, Long chatroomId) {
        userActiveChatrooms.put(userId, chatroomId);
    }

    // 특정 채팅방에서 나가기 (새로운 메서드)
    public void leaveChatroom(Long userId, Long chatroomId) {
        Long currentChatroomId = userActiveChatrooms.get(userId);
        if (currentChatroomId != null && currentChatroomId.equals(chatroomId)) {
            userActiveChatrooms.remove(userId);
        }
    }

    // 사용자가 지정된 채팅방에 현재 활성화되어 있는지 확인
    public boolean isUserInChatroom(Long userId, Long chatroomId) {
        Long currentChatroomId = userActiveChatrooms.get(userId);
        boolean isInChatroom = chatroomId.equals(currentChatroomId);
        return isInChatroom;
    }


}
