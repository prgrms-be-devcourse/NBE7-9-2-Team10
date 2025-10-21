package com.unimate.domain.user.user.controller;


import com.unimate.domain.user.user.dto.UserInfoResponse;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.service.UserService;
import com.unimate.global.jwt.CustomUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user")
@Validated
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserInfoResponse> getUserInfo(@AuthenticationPrincipal CustomUserPrincipal userPrincipal) {
        User user = userService.findByEmail(userPrincipal.getEmail());
        return ResponseEntity.ok(new UserInfoResponse(user.getEmail(), user.getName(), user.getGender(), user.getBirthDate(), user.getUniversity()));
    }
}