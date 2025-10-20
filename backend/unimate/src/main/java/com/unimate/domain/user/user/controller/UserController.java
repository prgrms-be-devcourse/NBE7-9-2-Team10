package com.unimate.domain.user.user.controller;

import com.unimate.domain.user.user.dto.UserSignupRequest;
import com.unimate.domain.user.user.dto.UserSignupResponse;
import com.unimate.domain.user.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
@Validated
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<User> getUserInfo(@AuthenticationPrincipal CustomUserPrincipal userPrincipal) {
        User user = userService.findByEmail(userPrincipal.getEmail());
        return ResponseEntity.ok(user);
    }
}