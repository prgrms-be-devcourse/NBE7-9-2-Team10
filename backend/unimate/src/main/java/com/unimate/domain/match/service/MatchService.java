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
import com.unimate.global.jwt.CustomUserPrincipal;
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

        // 중복 요청 방지
        matchRepository.findBySenderIdAndReceiverIdAndMatchType(senderId, receiverId, MatchType.LIKE)
                .ifPresent(match -> {
                    throw ServiceException.conflict("이미 해당 사용자에게 '좋아요'를 보냈습니다.");
                });

        Match newLike = Match.builder()
                .sender(sender)
                .receiver(receiver)
                .matchType(MatchType.LIKE)
                .matchStatus(MatchStatus.PENDING)
                .build();
        matchRepository.save(newLike);

        // 상대방이 보낸 좋아요가 있는지 확인
        Optional<Match> reciprocalLikeOpt = matchRepository.findBySenderIdAndReceiverIdAndMatchType(receiverId, senderId, MatchType.LIKE);

        boolean isMatched = reciprocalLikeOpt.isPresent();

        return new LikeResponse(newLike.getId(), isMatched);
    }

    public void cancelLike(Long senderId, Long receiverId) {
        Match like = matchRepository.findBySenderIdAndReceiverIdAndMatchType(senderId, receiverId, MatchType.LIKE)
                .orElseThrow(() -> ServiceException.notFound("취소할 '좋아요' 기록이 존재하지 않습니다."));

        matchRepository.delete(like);
    }
}
