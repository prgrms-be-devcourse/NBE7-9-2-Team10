package com.unimate.domain.userProfile.repository;

import com.unimate.domain.userProfile.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUserEmail(String email);
    Optional<UserProfile> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
