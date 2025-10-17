package com.unimate.global.jwt;

import java.security.Principal;

//Principal 인터페이스 구현 추가 -> STOMP user-destination 라우팅 키로 getName()을 사용하기 위함
public class CustomUserPrincipal implements Principal {
    private final Long userId;
    private final String email;

    public CustomUserPrincipal(Long userId, String email) {
        this.userId = userId;
        this.email = email;
    }

    public Long getUserId() { return userId; }
    public String getEmail() { return email; }

    @Override
    public String getName() {
        return String.valueOf(userId);
    }

    @Override
    public String toString() {
        return getName();
    }
}
