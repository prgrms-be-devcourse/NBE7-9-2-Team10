package com.unimate.domain.verification.repository;

import com.unimate.domain.verification.entity.Verification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationRepository extends JpaRepository<Verification, Long> {
    Optional<Verification> findByEmail(String email);
    void deleteByEmail(String email);
}
