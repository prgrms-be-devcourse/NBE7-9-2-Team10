package com.unimate.domain.userMatchPreference.repository;

import com.unimate.domain.userMatchPreference.entity.UserMatchPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserMatchPreferenceRepository extends JpaRepository<UserMatchPreference, Long> {
    Optional<UserMatchPreference> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}