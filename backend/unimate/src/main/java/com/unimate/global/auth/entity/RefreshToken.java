package com.unimate.global.auth.entity;

import com.unimate.global.auth.model.SubjectType;
import com.unimate.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(
        name = "refresh_token",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_subject_type_id", columnNames = {"subject_type", "subject_id"})
        },
        indexes = {
                @Index(name = "idx_refresh_token_value", columnList = "refresh_token")
        }
)
public class RefreshToken extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "subject_type", nullable = false, length = 20)
    private SubjectType subjectType;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "refresh_token", nullable = false, length = 512)
    private String refreshToken;

    public RefreshToken(SubjectType subjectType, Long subjectId, String email, String refreshToken) {
        this.subjectType = subjectType;
        this.subjectId = subjectId;
        this.email = email;
        this.refreshToken = refreshToken;
    }

    public void updateToken(String email, String newToken) {
        this.email = email;
        this.refreshToken = newToken;
    }
}
