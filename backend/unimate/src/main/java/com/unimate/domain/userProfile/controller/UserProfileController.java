package com.unimate.domain.userProfile.controller;

import com.unimate.domain.userProfile.dto.ProfileCreateRequest;
import com.unimate.domain.userProfile.dto.ProfileResponse;
import com.unimate.domain.userProfile.service.UserProfileService;
import com.unimate.global.jwt.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@Tag(name = "UserProfileController", description = "유저 프로필 API")
@SecurityRequirement(name = "BearerAuth")
public class UserProfileController {

    private final UserProfileService userProfileService;

    @PostMapping
    @Operation(summary = "유저 프로필 생성")
    public ResponseEntity<Object> createUserProfile(
            @Valid @RequestBody ProfileCreateRequest req,
            @AuthenticationPrincipal CustomUserPrincipal user
            )
    {
        ProfileResponse res = userProfileService.create(user.getEmail(), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping
    @Operation(summary = "유저 프로필 조회")
    public ResponseEntity<ProfileResponse> getMyProfile(
            @AuthenticationPrincipal CustomUserPrincipal user
    ) {
        ProfileResponse res = userProfileService.getByEmail(user.getEmail());
        return ResponseEntity.ok(res);
    }

    @PutMapping
    @Operation(summary = "유저 프로필 수정")
    public ResponseEntity<ProfileResponse> updateMyProfile(
            @Valid @RequestBody ProfileCreateRequest req,
            @AuthenticationPrincipal CustomUserPrincipal user
    ) {
        ProfileResponse res = userProfileService.update(user.getEmail(), req);
        return ResponseEntity.ok(res);
    }
}
