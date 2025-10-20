package com.unimate.global.auth.service;

import com.unimate.global.auth.dto.Tokens;
import com.unimate.global.auth.entity.RefreshToken;
import com.unimate.global.auth.model.SubjectType;
import com.unimate.global.auth.repository.RefreshTokenRepository;
import com.unimate.global.exception.ServiceException;
import com.unimate.global.jwt.JwtProvider;
import com.unimate.global.jwt.JwtToken;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public Tokens issueTokens(SubjectType subjectType, Long subjectId, String email) {
        JwtToken token = jwtProvider.generateToken(email, subjectId);

        refreshTokenRepository.findBySubjectTypeAndSubjectId(subjectType, subjectId)
                .ifPresentOrElse(
                        rt -> rt.updateToken(email, token.getRefreshToken()),
                        () -> refreshTokenRepository.save(new RefreshToken(subjectType, subjectId, email, token.getRefreshToken()))
                );

        return Tokens.of(subjectId, email, token.getAccessToken(), token.getRefreshToken());
    }

    @Transactional(readOnly = true)
    public String reissueAccessToken(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw ServiceException.unauthorized("유효하지 않은 리프레시 토큰입니다.");
        }

        RefreshToken stored = refreshTokenRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> ServiceException.notFound("저장된 리프레시 토큰이 없습니다."));

        JwtToken newToken = jwtProvider.generateToken(stored.getEmail(), stored.getSubjectId());
        return newToken.getAccessToken();
    }

    @Transactional
    public void logout(String refreshToken) {
        RefreshToken rt = refreshTokenRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> ServiceException.badRequest("유효하지 않은 리프레시 토큰입니다."));
        refreshTokenRepository.delete(rt);
    }
}
