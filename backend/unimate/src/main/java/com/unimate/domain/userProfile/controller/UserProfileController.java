package com.unimate.domain.userProfile.controller;

import com.unimate.domain.userProfile.dto.ProfileCreateRequest;
import com.unimate.domain.userProfile.dto.ProfileResponse;
import com.unimate.domain.userProfile.service.UserProfileService;
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
            @AuthenticationPrincipal(expression = "claims['email']") String email
            )
    {
        ProfileResponse res = userProfileService.create(email, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getMyProfile(
            @AuthenticationPrincipal(expression = "claims['email']") String email
    ) {
        ProfileResponse res = userProfileService.getByEmail(email);
        return ResponseEntity.ok(res);
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateMyProfile(
            @Valid @RequestBody ProfileCreateRequest req,
            @AuthenticationPrincipal(expression = "claims['email']") String email
    ) {
        ProfileResponse res = userProfileService.update(email, req);
        return ResponseEntity.ok(res);
    }
}
