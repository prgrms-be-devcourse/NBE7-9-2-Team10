package com.unimate.domain.match.repository;

import com.unimate.domain.match.entity.Match;
import com.unimate.domain.match.entity.MatchType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    // 보낸 사람과 받는 사람 기준으로 좋아요 기록 찾기
    Optional<Match> findBySenderIdAndReceiverIdAndMatchType(Long senderId, Long receiverId, MatchType matchType);

    // 양방향으로 두 사용자 간의 'LIKE' 기록을 찾는 메서드
    @Query("SELECT m FROM Match m WHERE m.matchType = 'LIKE' AND ((m.sender.id = :user1Id AND m.receiver.id = :user2Id) OR (m.sender.id = :user2Id AND m.receiver.id = :user1Id))")
    Optional<Match> findLikeBetweenUsers(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
}
