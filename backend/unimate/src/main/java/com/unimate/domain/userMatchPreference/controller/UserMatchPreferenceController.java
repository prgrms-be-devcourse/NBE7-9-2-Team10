package com.unimate.domain.userMatchPreference.controller;


import com.unimate.domain.userMatchPreference.dto.MatchPreferenceRequest;
import com.unimate.domain.userMatchPreference.dto.MatchPreferenceResponse;
import com.unimate.domain.userMatchPreference.service.UserMatchPreferenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UserMatchPreferenceController {

    private final UserMatchPreferenceService userMatchPreferenceService;

    // @PutMapping("/me/preferences")
    @PutMapping("/{userId}/preferences")
    public ResponseEntity<MatchPreferenceResponse> updateMyMatchPreference(
             @AuthenticationPrincipal UserDetailsImpl userDetails,
             @RequestBody MatchPreferenceRequest requestDto
            // 이하 postman 테스트 용 파라미터
            // @PathVariable("userId") Long userId,
            // @Valid @RequestBody MatchPreferenceRequest requestDto
              ) {

         Long userId = userDetails.getUserId();

        MatchPreferenceResponse responseDto = userMatchPreferenceService.updateMyMatchPreferences(userId, requestDto);
        return ResponseEntity.ok(responseDto);
    }

}
