package com.unimate.global.ws;

import com.unimate.global.jwt.CustomUserPrincipal;
import com.unimate.global.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final String SESSION_PRINCIPAL_KEY = "WS_PRINCIPAL";
    private final JwtProvider jwtProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = StompHeaderAccessor.wrap(message);
        StompCommand cmd = acc.getCommand();
        if (cmd == null) return message;

        // 이미 user가 있으면 그대로 통과
        if (acc.getUser() != null) {
            return message;
        }

        if (cmd == StompCommand.CONNECT) {
            String token = resolveTokenCaseInsensitive(acc);
            if (token != null) token = token.replaceAll("\\s+", "");

            if (token == null || !jwtProvider.validateToken(token)) {
                throw new AccessDeniedException("인증되지 않은 WebSocket 연결입니다.");
            }

            Long userId = jwtProvider.getUserIdFromToken(token);
            String email = jwtProvider.getEmailFromToken(token);

            CustomUserPrincipal principal = new CustomUserPrincipal(userId, email);
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(principal, null, Collections.emptyList());

            acc.setUser(auth);
            if (acc.getSessionAttributes() != null) {
                acc.getSessionAttributes().put(SESSION_PRINCIPAL_KEY, auth);
            }

            // 변경된 헤더로 새 메시지 리턴
            return MessageBuilder.createMessage(message.getPayload(), acc.getMessageHeaders());
        } else {
            // 비-CONNECT 프레임에서 세션 복구
            Principal saved = null;
            if (acc.getSessionAttributes() != null) {
                Object obj = acc.getSessionAttributes().get(SESSION_PRINCIPAL_KEY);
                if (obj instanceof Principal p) saved = p;
            }
            if (saved != null) {
                acc.setUser(saved);
                // 변경된 헤더로 새 메시지 리턴
                return MessageBuilder.createMessage(message.getPayload(), acc.getMessageHeaders());
            } else {
                return message;
            }
        }
    }

    private String resolveTokenCaseInsensitive(StompHeaderAccessor acc) {
        Map<String, List<String>> headers = acc.toNativeHeaderMap();
        if (headers == null || headers.isEmpty()) return null;

        String bearer = firstHeaderIgnoreCase(headers, "Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        String raw = firstHeaderIgnoreCase(headers, "access-token");
        return (raw == null || raw.isBlank()) ? null : raw;
    }

    private String firstHeaderIgnoreCase(Map<String, List<String>> headers, String key) {
        String target = key.toLowerCase(Locale.ROOT);
        for (Map.Entry<String, List<String>> e : headers.entrySet()) {
            if (e.getKey() != null && e.getKey().toLowerCase(Locale.ROOT).equals(target)) {
                List<String> vals = e.getValue();
                if (vals == null) return null;
                for (String v : vals) {
                    if (v != null && !v.isBlank()) return v;
                }
            }
        }
        return null;
    }
}
