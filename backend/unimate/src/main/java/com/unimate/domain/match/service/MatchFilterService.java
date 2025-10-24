package com.unimate.domain.match.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.unimate.domain.match.dto.CachedUserProfile;
import com.unimate.domain.userProfile.entity.UserProfile;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MatchFilterService {

    private final MatchUtilityService matchUtilityService;

    public boolean applyUniversityFilter(CachedUserProfile profile, String senderUniversity) {
        return profile.getUniversity().equals(senderUniversity);
    }

    public boolean applyUniversityFilter(UserProfile profile, String senderUniversity) {
        return profile.getUser().getUniversity().equals(senderUniversity);
    }

    public boolean applySleepPatternFilter(CachedUserProfile profile, String sleepPatternFilter) {
        if (sleepPatternFilter == null || sleepPatternFilter.trim().isEmpty()) {
            return true;
        }

        Integer sleepTime = profile.getSleepTime();

        return switch (sleepPatternFilter.toLowerCase()) {
            case "very_early" -> sleepTime == 5;
            case "early"      -> sleepTime == 4;
            case "normal"     -> sleepTime == 3;
            case "late"       -> sleepTime == 2;
            case "very_late"  -> sleepTime == 1;
            default           -> false;
        };
    }

    public boolean applySleepPatternFilter(UserProfile profile, String sleepPatternFilter) {
        if (sleepPatternFilter == null || sleepPatternFilter.trim().isEmpty()) {
            return true; // 필터 미적용 시 전체 허용
        }

        Integer sleepTime = profile.getSleepTime();

        return switch (sleepPatternFilter.toLowerCase()) {
            case "very_early" -> sleepTime == 5; // 22시 이전 
            case "early" -> sleepTime == 4; // 22시 ~ 00시 
            case "normal" -> sleepTime == 3; // 00시 ~ 02시 
            case "late" -> sleepTime == 2; // 02시 ~ 04시 
            case "very_late" -> sleepTime == 1; // 04시 이후 
            default -> false;
        };
    }

    public boolean applyAgeRangeFilter(CachedUserProfile profile, String ageRangeFilter) {
        if (ageRangeFilter == null || ageRangeFilter.trim().isEmpty()) {
            return true;
        }
    
        int age = matchUtilityService.calculateAge(profile.getBirthDate());
        return switch (ageRangeFilter.toLowerCase()) {
            case "20-22" -> age >= 20 && age <= 22;
            case "23-25" -> age >= 23 && age <= 25;
            case "26-28" -> age >= 26 && age <= 28;
            case "29-30" -> age >= 29 && age <= 30;
            case "31+"   -> age >= 31;
            default      -> false;
        };
    }

    public boolean applyAgeRangeFilter(UserProfile profile, String ageRangeFilter) {
        if (ageRangeFilter == null || ageRangeFilter.trim().isEmpty()) {
            return true; // 필터가 없으면 모든 나이대 허용
        }
    
        int age = matchUtilityService.calculateAge(profile.getUser().getBirthDate());
        return switch (ageRangeFilter.toLowerCase()) {
            case "20-22" -> age >= 20 && age <= 22;
            case "23-25" -> age >= 23 && age <= 25;
            case "26-28" -> age >= 26 && age <= 28;
            case "29-30" -> age >= 29 && age <= 30;
            case "31+" -> age >= 31;
            default -> false;
        };
    }

    public boolean applyCleaningFrequencyFilter(CachedUserProfile profile, String cleaningFrequencyFilter) {
        if (cleaningFrequencyFilter == null || cleaningFrequencyFilter.trim().isEmpty()) {
            return true;
        }
    
        Integer cleaningFrequency = profile.getCleaningFrequency();
    
        return switch (cleaningFrequencyFilter.toLowerCase()) {
            case "daily"                -> cleaningFrequency == 5;
            case "several_times_weekly" -> cleaningFrequency == 4;
            case "weekly"               -> cleaningFrequency == 3;
            case "monthly"              -> cleaningFrequency == 2;
            case "rarely"               -> cleaningFrequency == 1;
            default                     -> false;
        };
    }

    public boolean applyCleaningFrequencyFilter(UserProfile profile, String cleaningFrequencyFilter) {
        if (cleaningFrequencyFilter == null || cleaningFrequencyFilter.trim().isEmpty()) {
            return true; // 필터가 없으면 모든 청결도 허용
        }
    
        Integer cleaningFrequency = profile.getCleaningFrequency();
    
        return switch (cleaningFrequencyFilter.toLowerCase()) {
            case "daily" -> cleaningFrequency == 5; // 매일 청소
            case "several_times_weekly" -> cleaningFrequency == 4; // 주 2-3회
            case "weekly" -> cleaningFrequency == 3; // 주 1회
            case "monthly" -> cleaningFrequency == 2; // 월 1-2회
            case "rarely" -> cleaningFrequency == 1; // 거의 안함
            default -> false;
        };
    }

    public boolean hasOverlappingPeriodByRange(CachedUserProfile profile, LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) return true;

        LocalDate start = profile.getStartUseDate();
        LocalDate end   = profile.getEndUseDate();

        if (start == null || end == null) return false;

        return !start.isAfter(endDate) && !end.isBefore(startDate);
    }

    public boolean hasOverlappingPeriodByRange(UserProfile profile, LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) return true;

        LocalDate start = profile.getStartUseDate();
        LocalDate end   = profile.getEndUseDate();

        if (start == null || end == null) return false;

        return !start.isAfter(endDate) && !end.isBefore(startDate);
    }

}
