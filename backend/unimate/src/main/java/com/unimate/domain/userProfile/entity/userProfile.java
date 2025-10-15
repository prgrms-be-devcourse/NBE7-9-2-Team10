package com.unimate.domain.userProfile.entity;

import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.userProfile.dto.ProfileCreateRequest;
import com.unimate.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(
        name = "user_profile",
        uniqueConstraints = @UniqueConstraint(name = "uk_user_profile_user_id", columnNames = "user_id")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserProfile extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_user_profile_user")) //제약조건 이름 정하기 없으면 해시값으로 생성되어 관리하기 힘들다고함
    private User user;
    private LocalDate birthDate;
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

    @Builder
    private UserProfile(
            User user,
            LocalDate birthDate,
            Integer   sleepTime,
            Boolean   isPetAllowed,
            Boolean   isSmoker,
            Integer   cleaningFrequency,
            Integer   preferredAgeGap,
            Integer   hygieneLevel,
            Boolean   isSnoring,
            Integer   drinkingFrequency,
            Integer   noiseSensitivity,
            Integer   guestFrequency,
            String    mbti,
            LocalDate startUseDate,
            LocalDate endUseDate,
            Boolean   matchingEnabled
    ) {
        this.user              = user;
        this.birthDate         = birthDate;
        this.sleepTime         = sleepTime;
        this.isPetAllowed      = isPetAllowed;
        this.isSmoker          = isSmoker;
        this.cleaningFrequency = cleaningFrequency;
        this.preferredAgeGap   = preferredAgeGap;
        this.hygieneLevel      = hygieneLevel;
        this.isSnoring         = isSnoring;
        this.drinkingFrequency = drinkingFrequency;
        this.noiseSensitivity  = noiseSensitivity;
        this.guestFrequency    = guestFrequency;
        this.mbti              = mbti;
        this.startUseDate      = startUseDate;
        this.endUseDate        = endUseDate;
        this.matchingEnabled   = matchingEnabled;
    }

    public void update(ProfileCreateRequest req) {
        this.birthDate         = req.getBirthDate();
        this.sleepTime         = req.getSleepTime();
        this.isPetAllowed      = req.getIsPetAllowed();
        this.isSmoker          = req.getIsSmoker();
        this.cleaningFrequency = req.getCleaningFrequency();
        this.preferredAgeGap   = req.getPreferredAgeGap();
        this.hygieneLevel      = req.getHygieneLevel();
        this.isSnoring         = req.getIsSnoring();
        this.drinkingFrequency = req.getDrinkingFrequency();
        this.noiseSensitivity  = req.getNoiseSensitivity();
        this.guestFrequency    = req.getGuestFrequency();
        this.mbti              = req.getMbti();
        this.startUseDate      = req.getStartUseDate();
        this.endUseDate        = req.getEndUseDate();
        this.matchingEnabled   = req.getMatchingEnabled();
    }

    public void updateMatchingStatus(boolean matchingEnabled) {
        this.matchingEnabled = matchingEnabled;
    }
}
