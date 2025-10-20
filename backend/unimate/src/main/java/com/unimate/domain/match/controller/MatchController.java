package com.unimate.domain.match.controller;

import com.unimate.domain.match.dto.LikeRequest;
import com.unimate.domain.match.dto.LikeResponse;
import com.unimate.domain.match.dto.MatchRecommendationDetailResponse;
import com.unimate.domain.match.dto.MatchRecommendationResponse;
import com.unimate.domain.match.service.MatchService;
import com.unimate.global.jwt.CustomUserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    /**
     * 룸메이트 추천 목록 조회 (필터 적용)
     */
    @GetMapping("/recommendations")
    public ResponseEntity<MatchRecommendationResponse> getMatchRecommendations(
            @AuthenticationPrincipal CustomUserPrincipal user,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String university,
            @RequestParam(required = false) String sleepPattern,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        MatchRecommendationResponse response = matchService.getMatchRecommendations(
                user.getEmail(),
                gender,
                university,
                sleepPattern,
                startDate,
                endDate
        );
        return ResponseEntity.ok(response);
    }

    /**
     * 후보 프로필 상세 조회
     */
    @GetMapping("/candidates/{receiverId}")
    public ResponseEntity<MatchRecommendationDetailResponse> getMatchRecommendationDetail(
            @PathVariable Long receiverId,
            @AuthenticationPrincipal CustomUserPrincipal user
    ) {
        MatchRecommendationDetailResponse response =
                matchService.getMatchRecommendationDetail(user.getEmail(), receiverId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<LikeResponse> sendLike(
            @Valid @RequestBody LikeRequest requestDto,
            @AuthenticationPrincipal CustomUserPrincipal user) {

        LikeResponse response = matchService.sendLike(requestDto, user.getUserId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{receiverId}")
    public ResponseEntity<Void> cancelLike(
            @PathVariable Long receiverId,
            @AuthenticationPrincipal CustomUserPrincipal user) {

        matchService.cancelLike(user.getUserId(), receiverId);
        return ResponseEntity.noContent().build();
    }
}
