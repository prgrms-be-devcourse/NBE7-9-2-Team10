package com.unimate.domain.userProfile.repository;

import com.unimate.domain.userProfile.entity.userProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<userProfile, Long> {
    Optional<userProfile> findByUserEmail(String email);
}
