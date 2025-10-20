package com.unimate.domain.user.admin.repository;

import com.unimate.domain.user.admin.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<AdminUser, Long> {
    Optional<AdminUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
