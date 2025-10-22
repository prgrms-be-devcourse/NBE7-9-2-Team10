package com.unimate.domain.match.service;

import com.unimate.domain.userProfile.entity.UserProfile;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.Objects;

@Service
public class SimilarityCalculator {

    private static final int MAX_SCORE_SCALE = 5;
    private static final int MIN_SCORE_SCALE = 1;
    private static final double SCALE_RANGE = (double) (MAX_SCORE_SCALE - MIN_SCORE_SCALE);

    // 가중치
    private static final double WEIGHT_SMOKING = 0.20;
    private static final double WEIGHT_SLEEP = 0.20;
    private static final double WEIGHT_CLEANLINESS = 0.20;
    private static final double WEIGHT_AGE = 0.10;
    private static final double WEIGHT_NOISE = 0.10;
    private static final double WEIGHT_PET = 0.10;
    private static final double WEIGHT_LIFESTYLE = 0.10;

    public double calculateSimilarity(UserProfile userA, UserProfile userB) {
        // Null 체크 : 프로필 또는 필수 정보가 없으면 0점 반환
        if (userA == null || userB == null || userA.getUser() == null || userB.getUser() == null) return 0.0;

        // 항목별 점수 계산 & 카테고리별로 묶음

        // 흡연 점수
        double smokerScore = calculateBooleanScore(userA.getIsSmoker(), userB.getIsSmoker());

        // 수면 점수
        double sleepScore = calculateIntegerScore(userA.getSleepTime(), userB.getSleepTime());

        // 반려동물 점수
        double petScore = calculateBooleanScore(userA.getIsPetAllowed(), userB.getIsPetAllowed());

        // 나이 차이 점수
        double ageGapScore = calculateAgeGapScore(userA, userB);

        // 청결 점수 (청소 빈도 + 위생 수준)
        double cleaningFrequencyScore = calculateIntegerScore(userA.getCleaningFrequency(), userB.getCleaningFrequency());
        double hygieneLevelScore = calculateIntegerScore(userA.getHygieneLevel(), userB.getHygieneLevel());
        double cleanlinessScore = (cleaningFrequencyScore + hygieneLevelScore) / 2.0;

        // 소음 점수 (소음 민감도 + 코골이 여부)
        double noiseSensitivityScore = calculateIntegerScore(userA.getNoiseSensitivity(), userB.getNoiseSensitivity());
        double snoringScore = calculateBooleanScore(userA.getIsSnoring(), userB.getIsSnoring());
        double noiseScore = (noiseSensitivityScore + snoringScore) / 2.0;

        // 생활방식 점수 (음주 빈도 + 방문자 빈도)
        double drinkingFrequencyScore = calculateIntegerScore(userA.getDrinkingFrequency(), userB.getDrinkingFrequency());
        double guestFrequencyScore = calculateIntegerScore(userA.getGuestFrequency(), userB.getGuestFrequency());
        double lifestyleScore = (drinkingFrequencyScore + guestFrequencyScore) / 2.0;


        // 가중치 적용 및 최종 점수 계산
        double finalScore = (smokerScore * WEIGHT_SMOKING) +
                (sleepScore * WEIGHT_SLEEP) +
                (cleanlinessScore * WEIGHT_CLEANLINESS) +
                (ageRangeScore * WEIGHT_AGE) +
                (noiseScore * WEIGHT_NOISE) +
                (petScore * WEIGHT_PET) +
                (lifestyleScore * WEIGHT_LIFESTYLE);

        // 소수점 둘째 자리까지 반올림
        return Math.round(finalScore * 100) / 100.0;

    }

    private double calculateIntegerScore(Integer valueA, Integer valueB) {
        if (valueA == null || valueB == null) {
            return 0.0;
        }
        return 1.0 - (Math.abs(valueA - valueB) / SCALE_RANGE);
    }

    private double calculateBooleanScore(Boolean valueA, Boolean valueB) {
        if (valueA == null || valueB == null) {
            return 0.0;
        }
        return Objects.equals(valueA, valueB) ? 1.0 : 0.0;
    }

    private double calculateAgeRangeScore(UserProfile profileA, UserProfile profileB) {
        LocalDate birthDateA = profileA.getUser().getBirthDate();
        LocalDate birthDateB = profileB.getUser().getBirthDate();
        Integer preferredGapA = profileA.getPreferredAgeGap();
        Integer preferredGapB = profileB.getPreferredAgeGap();

        if (birthDateA == null || birthDateB == null || preferredGapA == null || preferredGapB == null) {
            return 0.0;
        }

        int ageA = Period.between(birthDateA, LocalDate.now()).getYears();
        int ageB = Period.between(birthDateB, LocalDate.now()).getYears();

        boolean isASatisfied = isAgeInRange(ageB, preferredGapA);
        boolean isBSatisfied = isAgeInRange(ageA, preferredGapB);

        if (isASatisfied && isBSatisfied) {
            return 1.0; // 둘 다 만족
        } else if (isASatisfied || isBSatisfied) {
            return 0.5; // 한 명만 만족
        } else {
            return 0.0; // 둘 다 불만족
        }
    }

    private boolean isAgeInRange(int age, int rangeCategory) {
        return switch (rangeCategory) {
            case 1 -> age >= 20 && age <= 22;
            case 2 -> age >= 23 && age <= 25;
            case 3 -> age >= 26 && age <= 28;
            case 4 -> age >= 29 && age <= 30;
            case 5 -> age >= 31;
            default -> false;
        };
    }
}
