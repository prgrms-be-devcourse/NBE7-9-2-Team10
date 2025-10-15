package com.unimate.domain.user.user.repository;

import com.unimate.domain.user.user.entity.user;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<user,Long> {
    Optional<user> findByEmail(String email);
    boolean existsByEmail(String email);
}
