package com.unimate.domain.userMatchPreference.controller;


import com.unimate.domain.userMatchPreference.dto.MatchPreferenceRequest;
import com.unimate.domain.userMatchPreference.dto.MatchPreferenceResponse;
import com.unimate.domain.userMatchPreference.service.UserMatchPreferenceService;
import com.unimate.global.jwt.CustomUserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UserMatchPreferenceController {

    private final UserMatchPreferenceService userMatchPreferenceService;

    @PutMapping("/me/preferences")
    public ResponseEntity<MatchPreferenceResponse> updateMyMatchPreference(
             @AuthenticationPrincipal CustomUserPrincipal user,
             @RequestBody MatchPreferenceRequest requestDto
              ) {

         Long userId = user.getUserId();

        MatchPreferenceResponse responseDto = userMatchPreferenceService.updateMyMatchPreferences(userId, requestDto);
        return ResponseEntity.ok(responseDto);
    }

}
