package com.unimate.domain.userMatchPreference.controller;


import com.unimate.domain.userMatchPreference.dto.MatchPreferenceRequest;
import com.unimate.domain.userMatchPreference.dto.MatchPreferenceResponse;
import com.unimate.domain.userMatchPreference.service.UserMatchPreferenceService;
import com.unimate.domain.userProfile.service.UserProfileService;
import com.unimate.global.jwt.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
@Tag(name = "UserMatchPreferenceController", description = "유저 매칭 선호도 API")
@SecurityRequirement(name = "BearerAuth")
public class UserMatchPreferenceController {

    private final UserMatchPreferenceService userMatchPreferenceService;
    private final UserProfileService userProfileService;

    @PutMapping("/me/preferences")
    @Operation(summary = "유저 매칭 선호도 수정")
    public ResponseEntity<MatchPreferenceResponse> updateMyMatchPreference(
             @AuthenticationPrincipal CustomUserPrincipal user,
             @Valid @RequestBody MatchPreferenceRequest requestDto
              ) {

         Long userId = user.getUserId();

        MatchPreferenceResponse responseDto = userMatchPreferenceService.updateMyMatchPreferences(userId, requestDto);
        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/me/matching-status")
    @Operation(summary = "유저 매칭 선호도 삭제")
    public ResponseEntity<Void> cancelMatchingStatus(@AuthenticationPrincipal CustomUserPrincipal user) {
        userProfileService.cancelMatching(user.getUserId());
        return ResponseEntity.noContent().build();
    }

}
