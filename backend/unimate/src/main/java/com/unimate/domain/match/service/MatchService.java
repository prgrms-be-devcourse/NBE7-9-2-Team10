package com.unimate.domain.match.service;

import com.unimate.domain.match.dto.LikeRequest;
import com.unimate.domain.match.dto.LikeResponse;
import com.unimate.domain.match.entity.Match;
import com.unimate.domain.match.entity.MatchStatus;
import com.unimate.domain.match.entity.MatchType;
import com.unimate.domain.match.repository.MatchRepository;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class MatchService {

    private final MatchRepository matchRepository;
    private final UserRepository userRepository;

    public LikeResponse sendLike(LikeRequest requestDto, Long senderId) {
        Long receiverId = requestDto.getReceiverId();

        if (senderId.equals(receiverId)) {
            throw ServiceException.badRequest("자기 자신에게 '좋아요'를 보낼 수 없습니다.");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> ServiceException.notFound("전송하는 사용자를 찾을 수 없습니다."));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> ServiceException.notFound("상대방 사용자를 찾을 수 없습니다."));

        // 양방향으로 기존 '좋아요' 기록이 있는지 확인
        Optional<Match> existingMatchOpt = matchRepository.findLikeBetweenUsers(senderId, receiverId);

        if (existingMatchOpt.isPresent()) {
            // 기존 기록이 있는 경우
            Match existingMatch = existingMatchOpt.get();

            // 이미 요청(REQUEST) 단계이거나, 내가 이미 보낸 '좋아요'인 경우 중복 처리
            if (existingMatch.getMatchType() == MatchType.REQUEST) {
                throw ServiceException.conflict("이미 룸메이트 요청이 진행 중입니다.");
            }
            if (existingMatch.getSender().getId().equals(senderId)) {
                throw ServiceException.conflict("이미 해당 사용자에게 '좋아요'를 보냈습니다.");
            }

            // 상호 '좋아요' 성립: 기존 Match의 타입을 REQUEST로 변경하고 sender/receiver를 교체
            // 요청의 주체는 상호 '좋아요'를 완성시킨 현재 사용자(sender)가 됨
            existingMatch.upgradeToRequest(sender, receiver);
            return new LikeResponse(existingMatch.getId(), true); // isMatched=true는 '요청' 단계로 넘어갔음을 의미

        } else {
            // 기존 기록이 없는 경우 (처음 '좋아요')
            Match newLike = Match.builder()
                    .sender(sender)
                    .receiver(receiver)
                    .matchType(MatchType.LIKE)
                    .matchStatus(MatchStatus.PENDING)
                    .build();
            matchRepository.save(newLike);

            return new LikeResponse(newLike.getId(), false); // 아직 상호 매칭(요청)은 아님
        }
    }
}
