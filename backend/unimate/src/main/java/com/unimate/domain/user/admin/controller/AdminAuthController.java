package com.unimate.domain.user.admin.controller;

import com.unimate.domain.user.admin.dto.AdminLoginRequest;
import com.unimate.domain.user.admin.dto.AdminLoginResponse;
import com.unimate.domain.user.admin.dto.AdminSignupRequest;
import com.unimate.domain.user.admin.dto.AdminSignupResponse;
import com.unimate.domain.user.admin.service.AdminAuthService;
import com.unimate.domain.user.admin.service.AdminService;
import com.unimate.global.auth.dto.AccessTokenResponse;
import com.unimate.global.auth.dto.MessageResponse;
import com.unimate.global.util.CookieUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/auth")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final AdminService adminUserService;

    @Value("${auth.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${auth.cookie.same-site:Lax}")
    private String cookieSameSite;

    @PostMapping("/signup")
    public ResponseEntity<AdminSignupResponse> signup(@Valid @RequestBody AdminSignupRequest request) {
        return ResponseEntity.ok(adminUserService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        var tokens = adminAuthService.login(request);

        ResponseCookie cookie = CookieUtils.httpOnlyCookie(
                "adminRefreshToken",
                tokens.getRefreshToken(),
                7L * 24 * 60 * 60,
                cookieSecure,
                cookieSameSite
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AdminLoginResponse(tokens.getSubjectId(), tokens.getEmail(), tokens.getAccessToken()));
    }

    @PostMapping("/token/refresh")
    public ResponseEntity<AccessTokenResponse> refreshToken(
            @CookieValue(name = "adminRefreshToken", required = false) String refreshToken
    ) {
        String newAccessToken = adminAuthService.reissueAccessToken(refreshToken);
        return ResponseEntity.ok(new AccessTokenResponse(newAccessToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(
            @CookieValue(name = "adminRefreshToken", required = false) String refreshToken
    ) {
        adminAuthService.logout(refreshToken);
        ResponseCookie expired = CookieUtils.expireCookie("adminRefreshToken", cookieSecure, cookieSameSite);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expired.toString())
                .body(new MessageResponse("관리자 로그아웃이 완료되었습니다."));
    }
}
