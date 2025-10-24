package com.unimate.domain.match.service;

import com.unimate.domain.chatroom.service.ChatroomService;
import com.unimate.domain.match.dto.*;
import com.unimate.domain.match.entity.Match;
import com.unimate.domain.match.entity.MatchStatus;
import com.unimate.domain.match.entity.MatchType;
import com.unimate.domain.match.repository.MatchRepository;
import com.unimate.domain.notification.entity.NotificationType;
import com.unimate.domain.notification.service.NotificationService;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.domain.userMatchPreference.repository.UserMatchPreferenceRepository;
import com.unimate.domain.userProfile.entity.UserProfile;
import com.unimate.domain.userProfile.repository.UserProfileRepository;
import com.unimate.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final SimilarityCalculator similarityCalculator;
    private final MatchFilterService matchFilterService;
    private final MatchUtilityService matchUtilityService;
    private final ChatroomService chatroomService;
    private final NotificationService notificationService;
    private final UserMatchPreferenceRepository userMatchPreferenceRepository;

    /**
     * 룸메이트 추천 목록 조회 (필터 반영)
     */
    public MatchRecommendationResponse getMatchRecommendations(
            String senderEmail,
            String sleepPatternFilter,
            String ageRangeFilter,
            String cleaningFrequencyFilter,
            LocalDate startDate,
            LocalDate endDate
    ) {
        User sender = getUserByEmail(senderEmail);
        UserProfile senderProfile = getUserProfile(sender.getId());
        
        List<UserProfile> candidates = filterCandidates(sender, sleepPatternFilter, ageRangeFilter, cleaningFrequencyFilter, startDate, endDate);
        List<MatchRecommendationResponse.MatchRecommendationItem> recommendations = buildRecommendations(candidates, senderProfile);
        
        return new MatchRecommendationResponse(recommendations);
    }

    /**
     * 이메일로 사용자 조회
     */
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> ServiceException.notFound("사용자를 찾을 수 없습니다."));
    }

    /**
     * 사용자 프로필 조회
     */
    private UserProfile getUserProfile(Long userId) {
        return userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> ServiceException.notFound("사용자 프로필을 찾을 수 없습니다."));
    }

    /**
     * 추천 후보 필터링
     */
    private List<UserProfile> filterCandidates(User sender, String sleepPatternFilter, String ageRangeFilter, 
            String cleaningFrequencyFilter, LocalDate startDate, LocalDate endDate) {
        return userProfileRepository.findAll()
                .stream()
                .filter(p -> !p.getUser().getId().equals(sender.getId()))
                // 자동 필터 (시스템에서 처리)
                .filter(p -> p.getUser().getGender().equals(sender.getGender())) // 같은 성별만 매칭
                .filter(p -> p.getMatchingEnabled()) // 매칭 활성화
                .filter(p -> userMatchPreferenceRepository.findByUserId(p.getUser().getId()).isPresent()) // 매칭 선호도 등록된 사용자만
                .filter(p -> matchFilterService.applyUniversityFilter(p, sender.getUniversity())) // 대학 필터 (같은 대학교만)
                // 사용자 선택 필터들
                .filter(p -> matchFilterService.applySleepPatternFilter(p, sleepPatternFilter)) // 수면 패턴 필터
                .filter(p -> matchFilterService.applyAgeRangeFilter(p, ageRangeFilter)) // 나이대 필터
                .filter(p -> matchFilterService.applyCleaningFrequencyFilter(p, cleaningFrequencyFilter)) // 청결도 필터
                .filter(p -> matchFilterService.hasOverlappingPeriodByRange(p, startDate, endDate)) // 거주 기간
                .toList();
    }

    /**
     * 추천 아이템 생성
     */
    private List<MatchRecommendationResponse.MatchRecommendationItem> buildRecommendations(
            List<UserProfile> candidates, UserProfile senderProfile) {
        return candidates.stream()
                .map(candidate -> buildRecommendationItem(candidate, senderProfile))
                .sorted(Comparator.comparing(MatchRecommendationResponse.MatchRecommendationItem::getPreferenceScore).reversed())
                .limit(10) // 최대 10명으로 제한
                .toList();
    }

    /**
     * 개별 추천 아이템 생성
     */
    private MatchRecommendationResponse.MatchRecommendationItem buildRecommendationItem(
            UserProfile candidate, UserProfile senderProfile) {
        BigDecimal similarityScore = BigDecimal.valueOf(similarityCalculator.calculateSimilarity(senderProfile, candidate));
        return MatchRecommendationResponse.MatchRecommendationItem.builder()
                .receiverId(candidate.getUser().getId())
                .name(candidate.getUser().getName())
                .university(candidate.getUser().getUniversity())
                .studentVerified(candidate.getUser().getStudentVerified())
                .gender(candidate.getUser().getGender())
                .age(matchUtilityService.calculateAge(candidate.getUser().getBirthDate()))
                .mbti(candidate.getMbti())
                .preferenceScore(similarityScore)
                .matchType(null)
                .matchStatus(null)
                .build();
    }

    private void validateUserMatchPreference(Long userId) {
        userMatchPreferenceRepository.findByUserId(userId)
            .orElseThrow(() -> ServiceException.notFound("매칭 선호도가 등록되지 않은 사용자입니다."));
    }

    /**
     * 후보 프로필 상세 조회
     */
    public MatchRecommendationDetailResponse getMatchRecommendationDetail(String senderEmail, Long receiverId) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> ServiceException.notFound("사용자를 찾을 수 없습니다."));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> ServiceException.notFound("상대방 사용자를 찾을 수 없습니다."));

        // 매칭 선호도 등록 여부 확인
        validateUserMatchPreference(receiverId);

        UserProfile receiverProfile = userProfileRepository.findByUserId(receiver.getId())
                .orElseThrow(() -> ServiceException.notFound("상대방 프로필을 찾을 수 없습니다."));

        UserProfile senderProfile = userProfileRepository.findByUserId(sender.getId())
                .orElseThrow(() -> ServiceException.notFound("사용자 프로필을 찾을 수 없습니다."));

        BigDecimal similarityScore = BigDecimal.valueOf(similarityCalculator.calculateSimilarity(senderProfile, receiverProfile));

        Optional<Match> existingMatch = matchRepository.findBySenderIdAndReceiverId(sender.getId(), receiverId);

        MatchType matchType = existingMatch.isPresent() ? existingMatch.get().getMatchType() : null;
        MatchStatus matchStatus = existingMatch.isPresent() ? existingMatch.get().getMatchStatus() : null;

        return MatchRecommendationDetailResponse.builder()
                .receiverId(receiver.getId())
                .name(receiver.getName())
                .university(receiver.getUniversity())
                .studentVerified(receiver.getStudentVerified())
                .mbti(receiverProfile.getMbti())
                .gender(receiver.getGender())
                .age(matchUtilityService.calculateAge(receiver.getBirthDate()))
                .isSmoker(receiverProfile.getIsSmoker())
                .isPetAllowed(receiverProfile.getIsPetAllowed())
                .isSnoring(receiverProfile.getIsSnoring())
                .sleepTime(receiverProfile.getSleepTime())
                .cleaningFrequency(receiverProfile.getCleaningFrequency())
                .hygieneLevel(receiverProfile.getHygieneLevel())
                .noiseSensitivity(receiverProfile.getNoiseSensitivity())
                .drinkingFrequency(receiverProfile.getDrinkingFrequency())
                .guestFrequency(receiverProfile.getGuestFrequency())
                .preferredAgeGap(receiverProfile.getPreferredAgeGap())
                .birthDate(receiver.getBirthDate())
                .startUseDate(receiverProfile.getStartUseDate())
                .endUseDate(receiverProfile.getEndUseDate())
                .preferenceScore(similarityScore)
                .matchType(matchType)
                .matchStatus(matchStatus)
                .build();
    }

    /**
     * 룸메이트 최종 확정
     */
    @Transactional
    public Match confirmMatch(Long matchId, Long userId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> ServiceException.notFound("매칭을 찾을 수 없습니다."));

        // 매칭 선호도 등록 여부 확인
        validateUserMatchPreference(match.getSender().getId());
        validateUserMatchPreference(match.getReceiver().getId());

        validateMatchParticipant(match, userId);
        validateMatchStatusTransition(match);
        validateAndHandleMatchTypeTransition(match);

        match.setMatchStatus(MatchStatus.ACCEPTED);
        match.setConfirmedAt(java.time.LocalDateTime.now());

        // TODO: 향후 후기 시스템과 연계된 재매칭 기능 구현 시 rematch_round 활용

        matchRepository.save(match);

        return match;
    }

    /**
     * 룸메이트 최종 거절
     */
    @Transactional
    public Match rejectMatch(Long matchId, Long userId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> ServiceException.notFound("매칭을 찾을 수 없습니다."));

        // 매칭 선호도 등록 여부 확인
        validateUserMatchPreference(match.getSender().getId());
        validateUserMatchPreference(match.getReceiver().getId());

        validateMatchParticipant(match, userId);
        validateMatchStatusTransition(match);
        validateAndHandleMatchTypeTransition(match);

        match.setMatchStatus(MatchStatus.REJECTED);
        match.setConfirmedAt(java.time.LocalDateTime.now()); // 거절 시점 기록

        // TODO: 향후 후기 시스템과 연계된 재매칭 기능 구현 시 rematch_round 활용

        matchRepository.save(match);

        return match;
    }

    /**
     * 매칭 상태 조회
     */
    public MatchStatusResponse getMatchStatus(Long userId) {
        List<Match> matches = matchRepository.findBySenderIdOrReceiverId(userId);

        List<MatchStatusResponse.MatchStatusItem> matchItems = matches.stream()
                .map(match -> matchUtilityService.toMatchStatusItem(match, userId))
                .toList();

        int total = matches.size();
        int pending = (int) matches.stream().filter(match -> match.getMatchStatus() == MatchStatus.PENDING).count();
        int accepted = (int) matches.stream().filter(match -> match.getMatchStatus() == MatchStatus.ACCEPTED).count();
        int rejected = (int) matches.stream().filter(match -> match.getMatchStatus() == MatchStatus.REJECTED).count();

        MatchStatusResponse.SummaryInfo summary = MatchStatusResponse.SummaryInfo.builder()
                .total(total)
                .pending(pending)
                .accepted(accepted)
                .rejected(rejected)
                .build();

        return MatchStatusResponse.builder()
                .matches(matchItems)
                .summary(summary)
                .build();
    }

    /**
     * 매칭 성사 결과 조회
     */
    public MatchResultResponse getMatchResults(Long userId) {
        List<MatchResultResponse.MatchResultItem> results = matchRepository.findBySenderIdOrReceiverId(userId)
                .stream()
                .filter(match -> match.getMatchStatus() == MatchStatus.ACCEPTED)
                .map(matchUtilityService::toMatchResultItem)
                .toList();

        return new MatchResultResponse(results);
    }


    /**
     * 좋아요 보내기
     */
    @Transactional
    public LikeResponse sendLike(LikeRequest requestDto, Long senderId) {
        Long receiverId = requestDto.getReceiverId();

        if (senderId.equals(receiverId)) {
            throw ServiceException.badRequest("자기 자신에게 '좋아요'를 보낼 수 없습니다.");
        }

        // 매칭 선호도 등록 여부 확인
        validateUserMatchPreference(receiverId);

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> ServiceException.notFound("전송하는 사용자를 찾을 수 없습니다."));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> ServiceException.notFound("상대방 사용자를 찾을 수 없습니다."));

        // (다시 좋아요) 만약 '좋아요 취소' 알림이 있었다면 삭제
        notificationService.deleteNotificationBySender(receiverId, NotificationType.LIKE_CANCELED, senderId);

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
            matchRepository.save(existingMatch);

            Long chatroomId = null;
            try {
                var chatroomResponse = chatroomService.createIfNotExists(senderId, receiverId);
                chatroomId = chatroomResponse.getChatroomId();
            } catch (Exception e) {
                // 채팅방 생성 실패해도 매칭은 진행
            }

            // 수정된 부분: 상호 좋아요 성사 알림 (매칭 알림) - 양쪽 모두에게 알림 전송
            try {
                // 받은 쪽에게 알림
                notificationService.createChatNotification(
                        receiverId,
                        NotificationType.MATCH,
                        sender.getName() + " 님과 매칭되었습니다!",
                        sender.getName(),
                        senderId,
                        chatroomId
                );

                // 보낸 쪽에게도 알림
                notificationService.createChatNotification(
                        senderId,
                        NotificationType.MATCH,
                        receiver.getName() + " 님과 매칭되었습니다!",
                        receiver.getName(),
                        receiverId,
                        chatroomId
                );
            } catch (Exception e) {
                // 알림 생성 실패해도 매칭은 진행
            }



            return new LikeResponse(existingMatch.getId(), true);

        } else {
            UserProfile senderProfile = userProfileRepository.findByUserId(senderId)
                    .orElseThrow(() -> ServiceException.notFound("사용자 프로필을 찾을 수 없습니다."));
            UserProfile receiverProfile = userProfileRepository.findByUserId(receiverId)
                    .orElseThrow(() -> ServiceException.notFound("상대방 프로필을 찾을 수 없습니다."));
            
            BigDecimal preferenceScore = BigDecimal.valueOf(similarityCalculator.calculateSimilarity(senderProfile, receiverProfile));
            
            // 기존 기록이 없는 경우 (처음 '좋아요')
            Match newLike = Match.builder()
                    .sender(sender)
                    .receiver(receiver)
                    .matchType(MatchType.LIKE)
                    .matchStatus(MatchStatus.PENDING)
                    .preferenceScore(preferenceScore)
                    .build();
            matchRepository.save(newLike);

            // (연타 방지) 이미 보낸 '좋아요' 알림이 없다면 새로 생성
            if (!notificationService.notificationExistsBySender(receiverId, NotificationType.LIKE, senderId)) {
                notificationService.createNotification(
                        receiverId,
                        NotificationType.LIKE,
                        sender.getName() + " 님이 회원님을 좋아합니다.",
                        sender.getName(),
                        senderId
                );
            }

            return new LikeResponse(newLike.getId(), false); // 아직 상호 매칭(요청)은 아님
        }
    }

    /**
     * 좋아요 취소
     */
    @Transactional
    public void cancelLike(Long senderId, Long receiverId) {
        // 매칭 선호도 등록 여부 확인
        validateUserMatchPreference(receiverId);

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> ServiceException.notFound("전송하는 사용자를 찾을 수 없습니다."));

        Match like = matchRepository.findBySenderIdAndReceiverIdAndMatchType(senderId, receiverId, MatchType.LIKE)
                .orElseThrow(() -> ServiceException.notFound("취소할 '좋아요' 기록이 존재하지 않습니다."));

        // 기존 '좋아요' 알림 삭제
        notificationService.deleteNotificationBySender(receiverId, NotificationType.LIKE, senderId);

        // '좋아요 취소' 알림이 없다면 새로 생성
        if (!notificationService.notificationExistsBySender(receiverId, NotificationType.LIKE_CANCELED, senderId)) {
            notificationService.createNotification(
                    receiverId,
                    NotificationType.LIKE_CANCELED,
                    sender.getName() + " 님이 좋아요를 취소했습니다.",
                    sender.getName(),
                    senderId
            );
        }

        matchRepository.delete(like);
    }

    /**
     * 매칭 참여자 권한 검증
     */
    private void validateMatchParticipant(Match match, Long userId) {
        if (!match.getSender().getId().equals(userId) && !match.getReceiver().getId().equals(userId)) {
            throw ServiceException.forbidden("룸메이트 확정 권한이 없습니다.");
        }
    }

    /**
     * 매칭 상태 전이 검증
     */
    private void validateMatchStatusTransition(Match match) {
        if (match.getMatchStatus() != MatchStatus.PENDING) {
            throw ServiceException.conflict("이미 처리된 매칭입니다.");
        }
    }

    /**
     * 매칭 타입 전이 처리 및 검증
     */
    private void validateAndHandleMatchTypeTransition(Match match) {
        if (match.getMatchType() == MatchType.LIKE) {
            // LIKE -> REQUEST 전이 처리 (영속 상태에서 자동 flush)
            match.upgradeToRequest(match.getSender(), match.getReceiver());
        } else if (match.getMatchType() != MatchType.REQUEST) {
            // REQUEST가 아닌 다른 타입은 처리 불가
            throw ServiceException.badRequest("요청 상태가 아닌 매칭은 처리할 수 없습니다.");
        }
        // REQUEST 타입은 그대로 진행 (검증만)
    }

}
