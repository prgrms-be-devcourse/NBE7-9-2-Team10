package com.unimate.domain.user.user.service;

import com.unimate.domain.user.user.dto.LoginRequest;
import com.unimate.domain.user.user.dto.LoginResponse;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.global.jwt.JwtProvider;
import com.unimate.global.jwt.JwtToken;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일을 찾을 수 없습니다.")); //custom 예외 클래스 사용 예정

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        JwtToken token = jwtProvider.generateToken(user.getEmail(), user.getId());

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                token.getAccessToken()
        );
    }
}
