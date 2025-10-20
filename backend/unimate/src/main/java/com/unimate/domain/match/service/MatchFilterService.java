package com.unimate.domain.match.service;

import com.unimate.domain.userProfile.entity.UserProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

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
            return true; // 필터가 없으면 모든 수면 패턴 허용
        }

        Integer sleepTime = profile.getSleepTime();
        if (sleepTime == null) {
            return true; // 수면 시간이 없으면 모든 패턴 허용
        }

        return switch (sleepPatternFilter.toLowerCase()) {
            case "early" -> sleepTime >= 20 && sleepTime <= 22; // 20-22시 (일찍 자는 패턴)
            case "normal" -> (sleepTime >= 22 && sleepTime <= 23) || (sleepTime >= 0 && sleepTime <= 2); // 22-02시 (일반적인 패턴)
            case "late" -> sleepTime >= 2 && sleepTime <= 6; // 02-06시 (늦게 자는 패턴)
            default -> true;
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
            case "20-25" -> age >= 20 && age <= 25;
            case "26-30" -> age >= 26 && age <= 30;
            case "31-35" -> age >= 31 && age <= 35;
            case "36+" -> age >= 36;
            default -> true;
        };
    }

    /**
     * 청결도 필터 적용
     */
    public boolean applyCleaningFrequencyFilter(UserProfile profile, String cleaningFrequencyFilter) {
        if (cleaningFrequencyFilter == null || cleaningFrequencyFilter.trim().isEmpty()) {
            return true; // 필터가 없으면 모든 청결도 허용
        }

        Integer cleaningFrequency = profile.getCleaningFrequency();
        if (cleaningFrequency == null) {
            return true; // 청결도 정보가 없으면 모든 패턴 허용
        }

        return switch (cleaningFrequencyFilter.toLowerCase()) {
            case "daily" -> cleaningFrequency == 5; // 매일 청소
            case "frequent" -> cleaningFrequency >= 3 && cleaningFrequency <= 4; // 자주 청소
            case "moderate" -> cleaningFrequency == 2; // 보통
            case "rare" -> cleaningFrequency <= 1; // 가끔
            default -> true;
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
