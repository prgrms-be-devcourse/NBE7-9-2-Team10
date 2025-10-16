package com.unimate.domain.user.user.service;

import com.unimate.domain.user.user.dto.LoginRequest;
import com.unimate.domain.user.user.entity.RefreshToken;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.RefreshTokenRepository;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.global.jwt.JwtProvider;
import com.unimate.global.jwt.JwtToken;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    public record AuthTokens(
            Long userId,
            String email,
            String accessToken,
            String refreshToken
    ) {
        public String getRefreshToken() {
            return this.refreshToken;
        }

        public Long getUserId() {
            return this.userId;
        }

        public String getEmail() {
            return this.email;
        }

        public String getAccessToken() {
            return this.accessToken;
        }
    }

    @Transactional
    public AuthTokens login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일을 찾을 수 없습니다.")); //custom 예외 클래스 사용 예정

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        JwtToken token = jwtProvider.generateToken(user.getEmail(), user.getId());

        refreshTokenRepository.findByUserId(user.getId())
                .ifPresentOrElse(
                        RefreshToken -> RefreshToken.updateToken(token.getRefreshToken()),
                        () -> refreshTokenRepository.save(new RefreshToken(user.getId(), token.getRefreshToken()))
                );

        return new AuthTokens(
                user.getId(),
                user.getEmail(),
                token.getAccessToken(),
                token.getRefreshToken()
        );
    }

    @Transactional
    public String reissueAccessToken(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }

        RefreshToken storedToken = refreshTokenRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("저장된 리프레시 토큰이 없습니다."));


        User user = userRepository.findById(storedToken.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        JwtToken newToken = jwtProvider.generateToken(user.getEmail(), user.getId());

        return newToken.getAccessToken();
    }

    @Transactional
    public void logout(String refreshToken) {
        RefreshToken tokenEntity = refreshTokenRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다."));

        refreshTokenRepository.delete(tokenEntity);
    }

}
