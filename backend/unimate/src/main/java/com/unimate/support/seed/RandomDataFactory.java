package com.unimate.support.seed;

import com.unimate.domain.user.user.entity.Gender;
import net.datafaker.Faker;

import java.time.LocalDate;
import java.util.Locale;
import java.util.Random;

public class RandomDataFactory {
    private final Faker f = new Faker(new Locale("ko"));
    private final Random r = new Random();

    public String email(int idx) {
        return "user" + idx + "@unimate.ar.kr";
    }

    public String name() {
        return f.name().fullName();
    }

    public Gender gender() {
        return r.nextBoolean() ? Gender.MALE : Gender.FEMALE;
    }

    public LocalDate birthDate() {
        return LocalDate.of(1990 + r.nextInt(10),
                1 + r.nextInt(12),
                1 + r.nextInt(28));
    }

    public Boolean studentVerified() {
        return true; // 기본적으로 인증된 학생으로 처리
    }

    public String university() {
        String[] universities = {"Unimate", "Korea Univ.", "Yonsei Univ.", "Sogang Univ.", "Hanyang Univ."};
        return universities[r.nextInt(universities.length)];
    }

    public int sleepTime() {
        return 20 + r.nextInt(6); // 20~25시
    }

    public boolean bool() {
        return r.nextBoolean();
    }

    public int range(int min, int max) {
        return min + r.nextInt(max - min + 1);
    }

    public String mbti() {
        String[] mbtis = {
                "INTP", "ENTP", "ENFP", "ISTJ",
                "ISFJ", "INFJ", "ESTJ", "ESFP"
        };
        return mbtis[r.nextInt(mbtis.length)];
    }

    public boolean snoring() {
        return r.nextBoolean();
    }

    public int drinkingFrequency() {
        return range(0, 5); // 0~5단계
    }

    public int guestFrequency() {
        return range(0, 5); // 0~5단계
    }

    public boolean matchingEnabled() {
        return r.nextBoolean();
    }

    public LocalDate startUseDate() {
        return LocalDate.now().minusMonths(range(0, 6));
    }

    public LocalDate endUseDate() {
        return LocalDate.now().plusMonths(range(1, 6));
    }
}
