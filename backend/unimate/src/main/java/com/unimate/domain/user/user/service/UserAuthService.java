package com.unimate.domain.user.user.service;

import com.unimate.domain.user.user.dto.UserLoginRequest;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.global.auth.dto.Tokens;
import com.unimate.global.auth.model.SubjectType;
import com.unimate.global.auth.service.TokenService;
import com.unimate.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserAuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @Transactional
    public Tokens login(UserLoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> ServiceException.notFound("이메일을 찾을 수 없습니다."));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw ServiceException.unauthorized("비밀번호가 일치하지 않습니다.");
        }

        return tokenService.issueTokens(SubjectType.USER, user.getId(), user.getEmail());
    }

    @Transactional(readOnly = true)
    public String reissueAccessToken(String refreshToken) {
        return tokenService.reissueAccessToken(refreshToken);
    }

    @Transactional
    public void logout(String refreshToken) {
        tokenService.logout(refreshToken);
    }
}
