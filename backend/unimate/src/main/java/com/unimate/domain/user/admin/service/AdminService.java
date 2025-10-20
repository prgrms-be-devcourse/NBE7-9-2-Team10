package com.unimate.domain.user.admin.service;

import com.unimate.domain.user.admin.dto.AdminSignupRequest;
import com.unimate.domain.user.admin.dto.AdminSignupResponse;
import com.unimate.domain.user.admin.entity.AdminUser;
import com.unimate.domain.user.admin.repository.AdminRepository;
import com.unimate.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminUserRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public AdminSignupResponse signup(AdminSignupRequest req) {
        if (adminUserRepository.existsByEmail(req.getEmail())) {
            throw ServiceException.badRequest("이미 등록된 관리자 이메일입니다.");
        }

        AdminUser admin = new AdminUser(
                req.getEmail(),
                passwordEncoder.encode(req.getPassword()),
                req.getName()
        );

        adminUserRepository.save(admin);
        return new AdminSignupResponse(admin.getId(), admin.getEmail(), admin.getName());
    }
}
