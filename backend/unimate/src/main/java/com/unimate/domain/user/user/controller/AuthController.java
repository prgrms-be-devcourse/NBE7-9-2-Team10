package com.unimate.domain.user.user.controller;

import com.unimate.domain.user.user.dto.LoginRequest;
import com.unimate.domain.user.user.dto.LoginResponse;
import com.unimate.domain.user.user.service.AuthService;
import com.unimate.global.jwt.CustomUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    //인증 테스트용 api
    @GetMapping("/me")
    public ResponseEntity<?> getUserInfo(@AuthenticationPrincipal CustomUserPrincipal user) {
        return ResponseEntity.ok(Map.of(
                "userId", user.getUserId(),
                "email", user.getEmail()
        ));
    }

    @PostMapping("/token/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        String newAccessToken = authService.reissueAccessToken(refreshToken);

        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        authService.logout(refreshToken);
        return ResponseEntity.ok(Map.of("message", "로그아웃이 완료되었습니다."));
    }
}
