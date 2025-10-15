package com.unimate.domain.user.user.repository;

import com.unimate.domain.user.user.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByRefreshToken(String token);
    Optional<RefreshToken> findByUserId(Long userId);
}
