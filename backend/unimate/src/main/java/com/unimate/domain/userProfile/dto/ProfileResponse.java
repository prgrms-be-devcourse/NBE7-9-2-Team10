package com.unimate.domain.userProfile.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {
    @NotNull private Long id;

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

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}