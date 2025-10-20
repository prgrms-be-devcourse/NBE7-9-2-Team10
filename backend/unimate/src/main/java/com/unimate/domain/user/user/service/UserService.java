package com.unimate.domain.user.user.service;

import com.unimate.domain.user.user.dto.UserSignupRequest;
import com.unimate.domain.user.user.dto.UserSignupResponse;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.domain.verification.service.VerificationService;
import com.unimate.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final VerificationService verificationService;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public UserSignupResponse signup(UserSignupRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw ServiceException.badRequest("이미 가입된 이메일입니다.");
        }

        verificationService.assertVerifiedEmailOrThrow(req.getEmail());

        User user = new User(
                req.getName(),
                req.getEmail(),
                passwordEncoder.encode(req.getPassword()),
                req.getGender(),
                req.getBirthDate(),
                req.getUniversity()
        );
        user.verifyStudent();

        userRepository.save(user);
        verificationService.consumeVerification(req.getEmail());

        return new UserSignupResponse(user.getId(), user.getEmail(), user.getName());
    }
}