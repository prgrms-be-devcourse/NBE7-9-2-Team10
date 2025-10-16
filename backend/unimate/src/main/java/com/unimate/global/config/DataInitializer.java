package com.unimate.global.config;

import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if(userRepository.count() == 0) {

            User user1 = new User(
                    "Test User 1",
                    "testuser1@unimate.com",
                    passwordEncoder.encode("password123"),
                    "Male",
                    LocalDate.of(1998, 1, 1),
                    "Unimate University"
            );

            User user2 = new User(
                    "Test User 2",
                    "testuser2@unimate.com",
                    passwordEncoder.encode("password456"),
                    "Female",
                    LocalDate.of(2000, 2, 2),
                    "Unimate University"
            );

            userRepository.saveAll(Arrays.asList(user1, user2));
        }
    }
}
