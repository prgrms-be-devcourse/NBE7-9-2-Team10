package com.unimate.domain.userProfile.service;

import com.unimate.domain.match.entity.MatchStatus;
import com.unimate.domain.match.entity.MatchType;
import com.unimate.domain.match.repository.MatchRepository;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.domain.userProfile.dto.ProfileCreateRequest;
import com.unimate.domain.userProfile.dto.ProfileResponse;
import com.unimate.domain.userProfile.entity.UserProfile;
import com.unimate.domain.userProfile.repository.UserProfileRepository;
import com.unimate.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;

    @Transactional
    public ProfileResponse create(String email, ProfileCreateRequest req){
        User userRef = userRepository.findByEmail(email).get();
        UserProfile profile = UserProfile.builder()
                .user(userRef)
                .sleepTime(req.getSleepTime())
                .isPetAllowed(req.getIsPetAllowed())
                .isSmoker(req.getIsSmoker())
                .cleaningFrequency(req.getCleaningFrequency())
                .preferredAgeGap(req.getPreferredAgeGap())
                .hygieneLevel(req.getHygieneLevel())
                .isSnoring(req.getIsSnoring())
                .drinkingFrequency(req.getDrinkingFrequency())
                .noiseSensitivity(req.getNoiseSensitivity())
                .guestFrequency(req.getGuestFrequency())
                .mbti(req.getMbti())
                .startUseDate(req.getStartUseDate())
                .endUseDate(req.getEndUseDate())
                .matchingEnabled(req.getMatchingEnabled())
                .build();

        UserProfile saved = userProfileRepository.save(profile);

        return toResponse(saved);
    }

    public ProfileResponse getByEmail(String email) {
        UserProfile profile = userProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> ServiceException.notFound("사용자 프로필을 찾을 수 없습니다."));

        return toResponse(profile);
    }

    @Transactional
    public ProfileResponse update(String email, ProfileCreateRequest req) {
        UserProfile profile = userProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> ServiceException.notFound("사용자 프로필을 찾을 수 없습니다."));

        profile.update(req);

        return toResponse(profile);
    }


    private ProfileResponse toResponse(UserProfile p) {
        return ProfileResponse.builder()
                .id(p.getId())
                .sleepTime(p.getSleepTime())
                .isPetAllowed(p.getIsPetAllowed())
                .isSmoker(p.getIsSmoker())
                .cleaningFrequency(p.getCleaningFrequency())
                .preferredAgeGap(p.getPreferredAgeGap())
                .hygieneLevel(p.getHygieneLevel())
                .isSnoring(p.getIsSnoring())
                .drinkingFrequency(p.getDrinkingFrequency())
                .noiseSensitivity(p.getNoiseSensitivity())
                .guestFrequency(p.getGuestFrequency())
                .mbti(p.getMbti())
                .startUseDate(p.getStartUseDate())
                .endUseDate(p.getEndUseDate())
                .matchingEnabled(p.getMatchingEnabled())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    // 룸메이트 매칭 비활성화
    @Transactional
    public void cancelMatching(Long userId) {

        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> ServiceException.notFound("사용자 프로필을 찾을 수 없습니다."));
        userProfile.updateMatchingStatus(false);

        matchRepository.deleteUnconfirmedMatchesByUserId(userId, MatchType.REQUEST, MatchStatus.ACCEPTED);
    }
}
