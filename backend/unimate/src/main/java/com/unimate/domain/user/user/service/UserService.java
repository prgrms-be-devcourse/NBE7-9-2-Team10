package com.unimate.domain.user.user.service;

import com.unimate.domain.user.user.dto.UserSignupRequest;
import com.unimate.domain.user.user.dto.UserSignupResponse;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.domain.verification.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final VerificationService verificationService;

    @Transactional
    public UserSignupResponse signup(UserSignupRequest req) {

        verificationService.assertVerifiedEmailOrThrow(req.getEmail());

        User user = new User(
                req.getName(),
                req.getEmail(),
                passwordEncoder.encode(req.getPassword()),
                req.getGender(),
                req.getBirthDate(),
                req.getUniversity()
        );
        user.setStudentVerified(true);

        userRepository.save(user);

        verificationService.consumeVerification(req.getEmail());

        return new UserSignupResponse(user.getId(), user.getEmail(), user.getName());
    }
}
