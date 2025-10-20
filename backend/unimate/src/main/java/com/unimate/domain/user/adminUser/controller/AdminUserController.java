package com.unimate.domain.user.adminUser.controller;

import com.unimate.domain.user.adminUser.dto.AdminLoginRequest;
import com.unimate.domain.user.adminUser.dto.AdminLoginResponse;
import com.unimate.domain.user.adminUser.entity.AdminUser;
import com.unimate.domain.user.adminUser.service.AdminUserService;
import com.unimate.global.jwt.JwtToken;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/auth")
public class AdminUserController {

    private final AdminUserService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(@RequestBody AdminLoginRequest request) {
        AdminUser admin = adminAuthService.login(request.getEmail(), request.getPassword());
        JwtToken token = adminAuthService.generateToken(admin);

        return ResponseEntity.ok(
                new AdminLoginResponse(admin.getId(), admin.getEmail(), token.getAccessToken())
        );
    }
}

