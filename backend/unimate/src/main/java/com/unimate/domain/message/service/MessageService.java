package com.unimate.domain.message.service;

import com.unimate.domain.chatroom.entity.Chatroom;
import com.unimate.domain.chatroom.service.ChatroomService;
import com.unimate.domain.message.dto.MessageSendResponse;
import com.unimate.domain.message.entity.Message;
import com.unimate.domain.message.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatroomService chatroomService;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * REST 방식 전송(멱등 보장)
     */
    @Transactional
    public MessageSendResponse sendText(Long me, Long chatroomId, String content, String clientMessageId) {
        Chatroom room = chatroomService.validateWritable(me, chatroomId);

        // 기존 메시지 존재 여부 확인
        var existing = messageRepository.findByChatroom_IdAndSenderIdAndClientMessageId(chatroomId, me, clientMessageId);
        if (existing.isPresent()) {
            var m = existing.get();
            return new MessageSendResponse(
                    m.getId(), chatroomId, me, m.getContent(),
                    m.getCreatedAt() == null ? null : m.getCreatedAt().format(ISO)
            );
        }

        try {
            // 새로 저장
            Message saved = messageRepository.save(Message.builder()
                    .chatroom(room)
                    .senderId(me)
                    .content(content)
                    .clientMessageId(clientMessageId)
                    .build());
            room.bumpLastMessage(saved.getId(), saved.getCreatedAt());

            return new MessageSendResponse(
                    saved.getId(), chatroomId, me, saved.getContent(),
                    saved.getCreatedAt() == null ? null : saved.getCreatedAt().format(ISO)
            );

        } catch (org.springframework.dao.DataIntegrityViolationException dup) {
            // 동시 중복 충돌 시 재조회하여 멱등 반환
            var m = messageRepository.findByChatroom_IdAndSenderIdAndClientMessageId(chatroomId, me, clientMessageId)
                    .orElseThrow(() -> dup);
            return new MessageSendResponse(
                    m.getId(), chatroomId, me, m.getContent(),
                    m.getCreatedAt() == null ? null : m.getCreatedAt().format(ISO)
            );
        }
    }
}