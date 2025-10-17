package com.unimate.domain.match.service;

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
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
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
        // 1️⃣ 현재 사용자 및 프로필 조회
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> ServiceException.notFound("사용자를 찾을 수 없습니다: " + senderEmail));

        UserProfile senderProfile = userProfileRepository.findByUserEmail(senderEmail)
                .orElseThrow(() -> ServiceException.notFound("프로필을 찾을 수 없습니다: " + senderEmail));

        // 2️⃣ 후보자 필터링 (쿼리 없이 Stream으로 처리)
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

        // 3️⃣ 후보별 유사도 계산 및 DTO 변환
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
x
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
}