package com.unimate.domain.userProfile.controller;

import com.unimate.domain.userProfile.dto.ProfileCreateRequest;
import com.unimate.domain.userProfile.dto.ProfileResponse;
import com.unimate.domain.userProfile.service.UserProfileService;
import com.unimate.global.jwt.CustomUserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @PostMapping
    public ResponseEntity<Object> createUserProfile(
            @Valid @RequestBody ProfileCreateRequest req,
            @AuthenticationPrincipal CustomUserPrincipal user
            )
    {
        ProfileResponse res = userProfileService.create(user.getEmail(), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getMyProfile(
            @AuthenticationPrincipal CustomUserPrincipal user
    ) {
        ProfileResponse res = userProfileService.getByEmail(user.getEmail());
        return ResponseEntity.ok(res);
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateMyProfile(
            @Valid @RequestBody ProfileCreateRequest req,
            @AuthenticationPrincipal CustomUserPrincipal user
    ) {
        ProfileResponse res = userProfileService.update(user.getEmail(), req);
        return ResponseEntity.ok(res);
    }
}
