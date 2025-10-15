package com.unimate.domain;


import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {

        if (userRepository.count() == 0) {
            User testUser = new User("testuser", "test@example.com", "password", "MALE", "Test University");
            userRepository.save(testUser);
        }
    }
}
