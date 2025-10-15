package com.unimate.global.jwt;

public class CustomUserPrincipal {
    private final Long userId;
    private final String email;

    public CustomUserPrincipal(Long userId, String email) {
        this.userId = userId;
        this.email = email;
    }

    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
}
