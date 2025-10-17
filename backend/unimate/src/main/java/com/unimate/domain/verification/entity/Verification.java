package com.unimate.domain.verification.entity;

import com.unimate.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Verification extends BaseEntity {

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 6)
    private String code;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime verifiedAt;

    public Verification(String email, String code, LocalDateTime expiresAt) {
        this.email = email;
        this.code = code;
        this.expiresAt = expiresAt;
    }

    public boolean isVerified() { return verifiedAt != null; }
    public boolean isExpired() { return LocalDateTime.now().isAfter(expiresAt); }

    public void updateCode(String code, LocalDateTime newExpiresAt) {
        this.code = code;
        this.expiresAt = newExpiresAt;
        this.verifiedAt = null;
    }

    public void markVerified() { this.verifiedAt = LocalDateTime.now(); }
}
