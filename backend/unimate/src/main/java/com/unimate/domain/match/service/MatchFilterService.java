package com.unimate.domain.match.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.unimate.domain.userProfile.entity.UserProfile;

import lombok.RequiredArgsConstructor;

/**
 * 매칭 필터링 로직을 담당하는 서비스
 */
@Service
@RequiredArgsConstructor
public class MatchFilterService {

    private final MatchUtilityService matchUtilityService;

    /**
     * 대학 필터 적용 - 같은 대학교만 허용
     */
    public boolean applyUniversityFilter(UserProfile profile, String senderUniversity) {
        return profile.getUser().getUniversity().equals(senderUniversity);
    }

    /**
     * 수면 패턴 필터 적용
     */
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

    /**
     * 나이대 필터 적용
     */
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

    /**
     * 청결도 필터 적용
     * cleaningFrequency 스케일: 5(매일), 4(주 2-3회), 3(주 1회), 2(월 1-2회), 1(거의 안함)
     */
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

    /**
     * 입주 가능 날짜 범위 기반으로 겹치는지 확인
     */
    public boolean hasOverlappingPeriodByRange(UserProfile profile, LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) return true; // 필터 없으면 통과

        LocalDate start = profile.getStartUseDate();
        LocalDate end = profile.getEndUseDate();

        if (start == null || end == null) return false;

        // 겹치는 기간 존재: start <= endDate && end >= startDate
        return !start.isAfter(endDate) && !end.isBefore(startDate);
    }

}
