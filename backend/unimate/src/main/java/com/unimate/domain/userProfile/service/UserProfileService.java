package com.unimate.domain.userProfile.service;

import com.unimate.domain.userProfile.dto.ProfileCreateRequest;
import com.unimate.domain.userProfile.dto.ProfileResponse;
import com.unimate.domain.userProfile.entity.userProfile;
import com.unimate.domain.userProfile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfileService {
    private final UserProfileRepository userProfileRepository;

    @Transactional
    public ProfileResponse create(String email, ProfileCreateRequest req){
        userProfile profile = userProfile.builder()
                .birthDate(req.getBirthDate())
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
                .build();

        userProfile saved = userProfileRepository.save(profile);

        return ProfileResponse.builder()
                .id(saved.getId())
                .birthDate(saved.getBirthDate())
                .sleepTime(saved.getSleepTime())
                .isPetAllowed(saved.getIsPetAllowed())
                .isSmoker(saved.getIsSmoker())
                .cleaningFrequency(saved.getCleaningFrequency())
                .preferredAgeGap(saved.getPreferredAgeGap())
                .hygieneLevel(saved.getHygieneLevel())
                .isSnoring(saved.getIsSnoring())
                .drinkingFrequency(saved.getDrinkingFrequency())
                .noiseSensitivity(saved.getNoiseSensitivity())
                .guestFrequency(saved.getGuestFrequency())
                .mbti(saved.getMbti())
                .startUseDate(saved.getStartUseDate())
                .endUseDate(saved.getEndUseDate())
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .build();
    }

}
