package com.unimate.domain.user.user.controller;

import com.unimate.domain.user.user.dto.UserSignupRequest;
import com.unimate.domain.user.user.dto.UserSignupResponse;
import com.unimate.domain.user.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class UserController {
    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<UserSignupResponse> signup(@RequestBody UserSignupRequest request) {
        return ResponseEntity.ok(userService.signup(request));
    }
}
