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
            throw ServiceException.badRequest("You cannot send a 'like' to yourself.");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> ServiceException.notFound("Sender not found."));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> ServiceException.notFound("Receiver not found."));

        // 중복 요청 방지
        matchRepository.findBySenderIdAndReceiverIdAndMatchType(senderId, receiverId, MatchType.LIKE)
                .ifPresent(match -> {
                    throw ServiceException.conflict("You have already sent a 'like' to this user.");
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

    public void cancelLike(Long receiverId, Long senderId) {
        Match like = matchRepository.findBySenderIdAndReceiverIdAndMatchType(receiverId, senderId, MatchType.LIKE)
                .orElseThrow(() -> ServiceException.notFound("The 'like' to be canceled does not exist."));

        matchRepository.delete(like);
    }
}
