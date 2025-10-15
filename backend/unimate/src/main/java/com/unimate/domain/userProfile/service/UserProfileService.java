package com.unimate.domain.userProfile.service;

import com.unimate.domain.userProfile.dto.ProfileCreateRequest;
import com.unimate.domain.userProfile.dto.ProfileResponse;
import com.unimate.domain.userProfile.entity.UserProfile;
import com.unimate.domain.userProfile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfileService {
    private final UserProfileRepository userProfileRepository;

    @Transactional
    public ProfileResponse create(String email, ProfileCreateRequest req){
        UserProfile profile = UserProfile.builder()
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
                .matchingEnabled(req.getMatchingEnabled())
                .build();

        UserProfile saved = userProfileRepository.save(profile);

        return toResponse(saved);
    }

    public ProfileResponse getByEmail(String email) {
        UserProfile profile = userProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "profile not found"));

        return toResponse(profile);
    }

    @Transactional
    public ProfileResponse update(String email, ProfileCreateRequest req) {
        UserProfile profile = userProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "profile not found"));

        profile.update(req);

        return toResponse(profile);
    }


    private ProfileResponse toResponse(UserProfile p) {
        return ProfileResponse.builder()
                .birthDate(p.getBirthDate())
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
}
