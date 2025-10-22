package com.unimate.domain.userMatchPreference.entity;

import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.userMatchPreference.dto.MatchPreferenceRequest;
import com.unimate.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Table(name = "user_match_preference")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserMatchPreference extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    private LocalDate startUseDate;
    private LocalDate endUseDate;
    private Integer sleepTime;
    private Boolean isPetAllowed;
    private Boolean isSmoker;
    private Integer cleaningFrequency;
    private Integer preferredAgeGap;
    private Integer hygieneLevel;
    private Boolean isSnoring;
    private Integer drinkingFrequency;
    private Integer noiseSensitivity;
    private Integer guestFrequency;

    @Builder
    public UserMatchPreference(User user, LocalDate startUseDate, LocalDate endUseDate,
                               Integer sleepTime, Boolean isPetAllowed, Boolean isSmoker, Integer cleaningFrequency,
                               Integer preferredAgeGap, Integer hygieneLevel, Boolean isSnoring,
                               Integer drinkingFrequency, Integer noiseSensitivity, Integer guestFrequency) {
        this.user = user;
        this.startUseDate = startUseDate;
        this.endUseDate = endUseDate;
        this.sleepTime = sleepTime;
        this.isPetAllowed = isPetAllowed;
        this.isSmoker = isSmoker;
        this.cleaningFrequency = cleaningFrequency;
        this.preferredAgeGap = preferredAgeGap;
        this.hygieneLevel = hygieneLevel;
        this.isSnoring = isSnoring;
        this.drinkingFrequency = drinkingFrequency;
        this.noiseSensitivity = noiseSensitivity;
        this.guestFrequency = guestFrequency;
    }

    public void update(MatchPreferenceRequest dto) {
        this.startUseDate = dto.getStartUseDate();
        this.endUseDate = dto.getEndUseDate();
        this.sleepTime = dto.getSleepTime();
        this.isPetAllowed = dto.getPetAllowed();
        this.isSmoker = dto.getSmoker();
        this.cleaningFrequency = dto.getCleaningFrequency();
        this.preferredAgeGap = dto.getPreferredAgeGap();
        this.hygieneLevel = dto.getHygieneLevel();
        this.isSnoring = dto.getSnoring();
        this.drinkingFrequency = dto.getDrinkingFrequency();
        this.noiseSensitivity = dto.getNoiseSensitivity();
        this.guestFrequency = dto.getGuestFrequency();
    }

    // 팩토리 메서드
    public static UserMatchPreference fromDto(User user, MatchPreferenceRequest dto) {
        return UserMatchPreference.builder()
                .user(user)
                .startUseDate(dto.getStartUseDate())
                .endUseDate(dto.getEndUseDate())
                .sleepTime(dto.getSleepTime())
                .isPetAllowed(dto.getPetAllowed())
                .isSmoker(dto.getSmoker())
                .cleaningFrequency(dto.getCleaningFrequency())
                .preferredAgeGap(dto.getPreferredAgeGap())
                .hygieneLevel(dto.getHygieneLevel())
                .isSnoring(dto.getSnoring())
                .drinkingFrequency(dto.getDrinkingFrequency())
                .noiseSensitivity(dto.getNoiseSensitivity())
                .guestFrequency(dto.getGuestFrequency())
                .build();
    }
}
