package com.unimate.domain;


import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.domain.userProfile.entity.UserProfile;
import com.unimate.domain.userProfile.repository.UserProfileRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        if (userRepository.count() == 0) {
            User testUser = new User("testuser", "test@example.com", "password", "MALE", "Test University");
            userRepository.save(testUser);

            UserProfile testUserProfile = UserProfile.builder()
                    .user(testUser)
                    .birthDate(LocalDate.of(2000, 1, 1))
                    .sleepTime(3)
                    .isPetAllowed(true)
                    .isSmoker(false)
                    .cleaningFrequency(4)
                    .preferredAgeGap(5)
                    .hygieneLevel(5)
                    .isSnoring(false)
                    .drinkingFrequency(2)
                    .noiseSensitivity(3)
                    .guestFrequency(1)
                    .mbti("ISTJ")
                    .startUseDate(LocalDate.of(2025, 3, 1))
                    .endUseDate(LocalDate.of(2026, 2, 28))
                    .matchingEnabled(false) // 초기값은 false
                    .build();
            userProfileRepository.save(testUserProfile);

        }
    }
}
