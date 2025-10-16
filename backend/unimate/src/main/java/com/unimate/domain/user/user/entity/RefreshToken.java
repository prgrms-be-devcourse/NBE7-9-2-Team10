package com.unimate.domain.user.user.entity;

import com.unimate.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
public class RefreshToken extends BaseEntity {

    private Long userId;
    private String refreshToken;
    private LocalDateTime revokedAt;

    public RefreshToken(Long userId, String refreshToken) {
        this.userId = userId;
        this.refreshToken = refreshToken;
    }

    public void updateToken(String token) {
        this.refreshToken = token;
    }
    public void revoke(){
        this.revokedAt = LocalDateTime.now();
    }
}