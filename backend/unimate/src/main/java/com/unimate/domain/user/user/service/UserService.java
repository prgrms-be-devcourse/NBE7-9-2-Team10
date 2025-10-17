package com.unimate.domain.user.user.service;

import com.unimate.domain.user.user.dto.UserSignupRequest;
import com.unimate.domain.user.user.dto.UserSignupResponse;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserSignupResponse signup(UserSignupRequest request) {
        if(userRepository.existsByEmail(request.getEmail())){
            throw ServiceException.badRequest("이미 존재하는 이메일 입니다.");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User newUser = new User(request.getName(), request.getEmail(), encodedPassword, request.getGender(), request.getBirthDate(), request.getUniversity());
        userRepository.save(newUser);

        return new UserSignupResponse(newUser.getId(), newUser.getEmail(), newUser.getName());
    }


}
