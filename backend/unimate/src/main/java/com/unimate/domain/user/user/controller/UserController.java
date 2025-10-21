package com.unimate.domain.user.user.controller;

import com.unimate.domain.user.user.dto.UserInfoResponse;
import com.unimate.domain.user.user.dto.UserUpdateEmailRequest;
import com.unimate.domain.user.user.dto.UserUpdateNameRequest;
import com.unimate.domain.user.user.dto.UserUpdateResponse;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.service.UserService;
import com.unimate.global.jwt.CustomUserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user")
@Validated
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserInfoResponse> getUserInfo(@AuthenticationPrincipal CustomUserPrincipal userPrincipal) {
        User user = userService.findByEmail(userPrincipal.getEmail());
        return ResponseEntity.ok(
                new UserInfoResponse(
                        user.getEmail(),
                        user.getName(),
                        user.getGender(),
                        user.getBirthDate(),
                        user.getUniversity()
                ));
    }

    @PutMapping("/name")
    public ResponseEntity<UserUpdateResponse> updateUserName(
            @AuthenticationPrincipal CustomUserPrincipal userPrincipal,
            @RequestBody UserUpdateNameRequest request
            ) {
        User user = userService.updateName(userPrincipal.getEmail(), request.getName());
        return ResponseEntity.ok(
                new UserUpdateResponse(
                        user.getEmail(),
                        user.getName(),
                        user.getGender(),
                        user.getBirthDate(),
                        user.getUniversity()
                ));
    }


    @PutMapping("/email")
    public ResponseEntity<UserUpdateResponse> updateUserEmail(
            @AuthenticationPrincipal CustomUserPrincipal userPrincipal,
            @Valid @RequestBody UserUpdateEmailRequest request
    ) {
        User updated = userService.updateEmail(userPrincipal.getEmail(), request);
        return ResponseEntity.ok(
                new UserUpdateResponse(
                        updated.getEmail(),
                        updated.getName(),
                        updated.getGender(),
                        updated.getBirthDate(),
                        updated.getUniversity()
                ));
    }
}
