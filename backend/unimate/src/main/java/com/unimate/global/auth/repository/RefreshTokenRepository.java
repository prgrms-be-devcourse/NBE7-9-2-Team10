package com.unimate.global.auth.repository;

import com.unimate.global.auth.entity.RefreshToken;
import com.unimate.global.auth.model.SubjectType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findBySubjectTypeAndSubjectId(SubjectType type, Long subjectId);

    Optional<RefreshToken> findByRefreshToken(String refreshToken);

    void deleteBySubjectTypeAndSubjectId(SubjectType type, Long subjectId);
}