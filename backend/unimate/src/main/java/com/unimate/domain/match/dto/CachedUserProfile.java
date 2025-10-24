package com.unimate.domain.match.dto;

import com.unimate.domain.user.user.entity.Gender;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.userProfile.entity.UserProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

// Redis 캐시용 DTO
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CachedUserProfile implements Serializable {

    private static final long serialVersionUID = 1L;

    // user
    private Long      userId;
    private String    name;
    private String    email;
    private Gender    gender;
    private LocalDate birthDate;
    private String    university;
    private Boolean   studentVerified;

    // userProfile  
    private Integer   sleepTime;
    private Boolean   isPetAllowed;
    private Boolean   isSmoker;
    private Integer   cleaningFrequency;
    private Integer   preferredAgeGap;
    private Integer   hygieneLevel;
    private Boolean   isSnoring;
    private Integer   drinkingFrequency;
    private Integer   noiseSensitivity;
    private Integer   guestFrequency;
    private String    mbti;
    private LocalDate startUseDate;
    private LocalDate endUseDate;
    private Boolean   matchingEnabled;


    public static CachedUserProfile from(UserProfile userProfile) {
        User user = userProfile.getUser();
        
        return CachedUserProfile.builder()
                // user
                .userId           (user.getId())
                .name             (user.getName())
                .email            (user.getEmail())
                .gender           (user.getGender())
                .birthDate        (user.getBirthDate())
                .university       (user.getUniversity())
                .studentVerified  (user.getStudentVerified())
                // userProfile
                .sleepTime        (userProfile.getSleepTime())
                .isPetAllowed     (userProfile.getIsPetAllowed())
                .isSmoker         (userProfile.getIsSmoker())
                .cleaningFrequency(userProfile.getCleaningFrequency())
                .preferredAgeGap  (userProfile.getPreferredAgeGap())
                .hygieneLevel     (userProfile.getHygieneLevel())
                .isSnoring        (userProfile.getIsSnoring())
                .drinkingFrequency(userProfile.getDrinkingFrequency())
                .noiseSensitivity (userProfile.getNoiseSensitivity())
                .guestFrequency   (userProfile.getGuestFrequency())
                .mbti             (userProfile.getMbti())
                .startUseDate     (userProfile.getStartUseDate())
                .endUseDate       (userProfile.getEndUseDate())
                .matchingEnabled  (userProfile.getMatchingEnabled())
                .build();
    }
}

