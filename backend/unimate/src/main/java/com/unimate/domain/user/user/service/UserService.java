package com.unimate.domain.user.user.service;

import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.domain.verification.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final VerificationService verificationService;
    private final BCryptPasswordEncoder passwordEncoder;


}