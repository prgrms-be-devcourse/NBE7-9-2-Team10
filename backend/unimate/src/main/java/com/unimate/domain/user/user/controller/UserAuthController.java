package com.unimate.domain.user.user.controller;

import com.unimate.domain.user.user.dto.UserLoginRequest;
import com.unimate.domain.user.user.dto.UserLoginResponse;
import com.unimate.domain.user.user.dto.UserSignupRequest;
import com.unimate.domain.user.user.dto.UserSignupResponse;
import com.unimate.domain.user.user.service.UserAuthService;
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
@RequestMapping("/api/v1/auth")
public class UserAuthController {

    private final UserAuthService userAuthService;

    @Value("${auth.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${auth.cookie.same-site:Lax}")
    private String cookieSameSite;

    @PostMapping("/signup")
    public ResponseEntity<UserSignupResponse> signup(@Valid @RequestBody UserSignupRequest request) {
        return ResponseEntity.ok(userAuthService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(@Valid @RequestBody UserLoginRequest request) {
        var tokens = userAuthService.login(request);

        ResponseCookie cookie = CookieUtils.httpOnlyCookie(
                "refreshToken",
                tokens.getRefreshToken(),
                7L * 24 * 60 * 60,
                cookieSecure,
                cookieSameSite
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new UserLoginResponse(tokens.getSubjectId(), tokens.getEmail(), tokens.getAccessToken()));
    }

    @PostMapping("/token/refresh")
    public ResponseEntity<AccessTokenResponse> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken
    ) {
        String newAccessToken = userAuthService.reissueAccessToken(refreshToken);
        return ResponseEntity.ok(new AccessTokenResponse(newAccessToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken
    ) {
        userAuthService.logout(refreshToken);
        ResponseCookie expired = CookieUtils.expireCookie("refreshToken", cookieSecure, cookieSameSite);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expired.toString())
                .body(new MessageResponse("로그아웃이 완료되었습니다."));
    }
}
