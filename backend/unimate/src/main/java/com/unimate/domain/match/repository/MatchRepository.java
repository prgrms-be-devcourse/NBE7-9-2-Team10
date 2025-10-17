package com.unimate.domain.match.repository;

import com.unimate.domain.match.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MatchRepository extends JpaRepository<Match, Long> {
    Optional<Match> findBySenderIdAndReceiverId(Long senderId, Long receiverId);

}