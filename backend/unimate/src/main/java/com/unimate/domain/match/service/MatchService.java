package com.unimate.domain.match.service;

import com.unimate.domain.match.dto.LikeRequest;
import com.unimate.domain.match.dto.LikeResponse;
import com.unimate.domain.match.dto.MatchRecommendationDetailResponse;
import com.unimate.domain.match.dto.MatchRecommendationResponse;
import com.unimate.domain.match.entity.Match;
import com.unimate.domain.match.entity.MatchStatus;
import com.unimate.domain.match.entity.MatchType;
import com.unimate.domain.match.repository.MatchRepository;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.domain.userProfile.entity.UserProfile;
import com.unimate.domain.userProfile.repository.UserProfileRepository;
import com.unimate.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MatchService {

    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final SimilarityCalculator similarityCalculator;

    /**
     * 룸메이트 추천 목록 조회 (필터 반영)
     */
    public MatchRecommendationResponse getMatchRecommendations(
            String senderEmail,
            String genderFilter,
            String universityFilter,
            String sleepPatternFilter,
            LocalDate startDate,
            LocalDate endDate
    ) {
        // 현재 사용자 및 프로필 조회
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> ServiceException.notFound("사용자를 찾을 수 없습니다: " + senderEmail));

        UserProfile senderProfile = userProfileRepository.findByUserEmail(senderEmail)
                .orElseThrow(() -> ServiceException.notFound("프로필을 찾을 수 없습니다: " + senderEmail));

        // 후보자 필터링
        List<UserProfile> candidates = userProfileRepository.findAll().stream()
                .filter(p -> p.getUser() != null)
                .filter(p -> !Objects.equals(p.getUser().getEmail(), senderEmail)) // 본인 제외
                .filter(p -> Boolean.TRUE.equals(p.getMatchingEnabled()))          // 매칭 활성화
                .filter(p -> p.getUser().getGender() == sender.getGender())        // 같은 성별
                .filter(p -> Objects.equals(p.getUser().getUniversity(), sender.getUniversity())) // 같은 학교
                .filter(p -> hasOverlappingPeriodByRange(p, startDate, endDate))
                .filter(this::isWithinMatchingPeriod)
                .limit(10)
                .collect(Collectors.toList());

        // 후보별 유사도 계산 및 DTO 변환
        List<MatchRecommendationResponse.MatchRecommendationItem> items = candidates.stream()
                .map(p -> {
                    BigDecimal score = BigDecimal.valueOf(similarityCalculator.calculateSimilarity(senderProfile, p));
                    return new MatchRecommendationResponse.MatchRecommendationItem(
                            p.getUser().getId(),
                            p.getUser().getName(),
                            p.getUser().getUniversity(),
                            p.getUser().getStudentVerified(),
                            p.getUser().getGender().toString(),
                            calculateAge(p.getUser().getBirthDate()),
                            p.getMbti(),
                            score,
                            MatchType.LIKE,
                            MatchStatus.PENDING
                    );
                })
                .sorted(Comparator.comparing(MatchRecommendationResponse.MatchRecommendationItem::getPreferenceScore)
                        .reversed()) // 높은 점수 순
                .collect(Collectors.toList());

        return new MatchRecommendationResponse(items);
    }

    /**
     * 후보 프로필 상세 조회
     */
    public MatchRecommendationDetailResponse getMatchRecommendationDetail(String senderEmail, Long receiverId) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> ServiceException.notFound("사용자를 찾을 수 없습니다: " + senderEmail));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> ServiceException.notFound("후보 사용자를 찾을 수 없습니다: " + receiverId));

        UserProfile senderProfile = userProfileRepository.findByUserEmail(senderEmail)
                .orElseThrow(() -> ServiceException.notFound("프로필을 찾을 수 없습니다: " + senderEmail));

        UserProfile receiverProfile = userProfileRepository.findByUserEmail(receiver.getEmail())
                .orElseThrow(() -> ServiceException.notFound("프로필을 찾을 수 없습니다: " + receiver.getEmail()));

        BigDecimal preferenceScore = BigDecimal.valueOf(
                similarityCalculator.calculateSimilarity(senderProfile, receiverProfile));

        Match existingMatch = matchRepository.findBySenderIdAndReceiverId(sender.getId(), receiverId).orElse(null);
        MatchType matchType = existingMatch != null ? existingMatch.getMatchType() : MatchType.LIKE;
        MatchStatus matchStatus = existingMatch != null ? existingMatch.getMatchStatus() : MatchStatus.PENDING;

        return new MatchRecommendationDetailResponse(
                receiver.getId(),
                receiver.getName(),
                receiver.getUniversity(),
                receiver.getStudentVerified(),
                receiverProfile.getMbti(),
                receiver.getGender().toString(),
                calculateAge(receiver.getBirthDate()),
                receiverProfile.getIsSmoker(),
                receiverProfile.getIsPetAllowed(),
                receiverProfile.getIsSnoring(),
                receiverProfile.getSleepTime(),
                receiverProfile.getCleaningFrequency(),
                receiverProfile.getHygieneLevel(),
                receiverProfile.getNoiseSensitivity(),
                receiverProfile.getDrinkingFrequency(),
                receiverProfile.getGuestFrequency(),
                receiverProfile.getPreferredAgeGap(),
                receiver.getBirthDate(),
                receiverProfile.getStartUseDate(),
                receiverProfile.getEndUseDate(),
                preferenceScore,
                matchType,
                matchStatus
        );
    }

    private Integer calculateAge(LocalDate birthDate) {
        if (birthDate == null) return null;
        LocalDate today = LocalDate.now();
        int years = Period.between(birthDate, today).getYears();
        return Math.max(0, today.isBefore(birthDate.plusYears(years)) ? years - 1 : years);
    }

    private boolean isWithinMatchingPeriod(UserProfile profile) {
        LocalDate now = LocalDate.now();
        LocalDate start = profile.getStartUseDate();
        LocalDate end = profile.getEndUseDate();
        return start != null && end != null && !now.isBefore(start) && !now.isAfter(end);
    }

    // 입주 가능 날짜 범위 기반으로 겹치는지 확인
    private boolean hasOverlappingPeriodByRange(UserProfile profile, LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) return true; // 필터 없으면 통과

        LocalDate start = profile.getStartUseDate();
        LocalDate end = profile.getEndUseDate();

        if (start == null || end == null) return false;

        // 겹치는 기간 존재: start <= endDate && end >= startDate
        return !start.isAfter(endDate) && !end.isBefore(startDate);
    }

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

    public void cancelLike(Long senderId, Long receiverId) {
        Match like = matchRepository.findBySenderIdAndReceiverIdAndMatchType(senderId, receiverId, MatchType.LIKE)
                .orElseThrow(() -> ServiceException.notFound("취소할 '좋아요' 기록이 존재하지 않습니다."));

        matchRepository.delete(like);
    }
}
