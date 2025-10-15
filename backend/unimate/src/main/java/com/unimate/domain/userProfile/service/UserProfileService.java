package com.unimate.domain.userProfile.service;

import com.unimate.domain.userProfile.dto.ProfileCreateRequest;
import com.unimate.domain.userProfile.dto.ProfileResponse;
import com.unimate.domain.userProfile.entity.userProfile;
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

        return toResponse(saved);
    }


    public ProfileResponse getByEmail(String email) {
        userProfile profile = userProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "profile not found"));
        return toResponse(profile);
    }

    @Transactional
    public ProfileResponse update(String email, ProfileCreateRequest req) {
        userProfile profile = userProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "profile not found"));

        profile.update(req);

        return toResponse(profile);
    }


    private ProfileResponse toResponse(userProfile p) {
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
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
