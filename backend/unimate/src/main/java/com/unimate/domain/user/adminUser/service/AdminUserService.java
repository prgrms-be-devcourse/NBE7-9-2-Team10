package com.unimate.domain.user.adminUser.service;

import com.unimate.domain.user.adminUser.entity.AdminUser;
import com.unimate.domain.user.adminUser.repository.AdminUserRepository;
import com.unimate.global.exception.ServiceException;
import com.unimate.global.jwt.JwtProvider;
import com.unimate.global.jwt.JwtToken;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final AdminUserRepository adminUserRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public AdminUser login(String email, String password) {
        AdminUser admin = adminUserRepository.findByEmail(email)
                .orElseThrow(() -> ServiceException.notFound("관리자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw ServiceException.unauthorized("비밀번호가 일치하지 않습니다.");
        }

        return admin;
    }

    public JwtToken generateToken(AdminUser admin) {
        return jwtProvider.generateToken(admin.getEmail(), admin.getId());
    }
}
