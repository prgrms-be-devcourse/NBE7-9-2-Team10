package com.unimate.domain.match.repository;

import com.unimate.domain.match.entity.Match;
import com.unimate.domain.match.entity.MatchType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    // 보낸 사람과 받는 사람 기준으로 좋아요 기록 찾기
    Optional<Match> findBySenderIdAndReceiverIdAndMatchType(Long senderId, Long receiverId, MatchType matchType);
}
