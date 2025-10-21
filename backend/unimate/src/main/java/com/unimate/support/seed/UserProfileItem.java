package com.unimate.support.seed;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class UserProfileItem {
    private String email;
    private String password;
    private String name;
    private String gender;
    private LocalDate birthDate;
    private Boolean studentVerified;
    private String university;
    private int sleepTime;
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
}
