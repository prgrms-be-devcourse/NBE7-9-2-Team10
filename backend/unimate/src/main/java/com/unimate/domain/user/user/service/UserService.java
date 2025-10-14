package com.unimate.domain.user.user.service;

import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User join(String name, String email, String password,  String gender, String university) {
        User user = new User(name, email, password, gender, university);
        userRepository.save(user);
        return user;
    }
}