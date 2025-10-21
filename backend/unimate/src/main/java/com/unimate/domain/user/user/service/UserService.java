package com.unimate.domain.user.user.service;

import com.unimate.domain.user.user.dto.UserUpdateRequest;
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
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> ServiceException.notFound("사용자를 찾을 수 없습니다."));
    }

    @Transactional
    public User update(String email, UserUpdateRequest request) {
        User user = findByEmail(email);
        user.update(request.getName(), request.getEmail(), request.getBirthDate(), request.getUniversity());
        return userRepository.save(user);
    }
}