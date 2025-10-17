package com.unimate.domain.match.controller;

import com.unimate.domain.match.dto.MatchRecommendationDetailResponse;
import com.unimate.domain.match.dto.MatchRecommendationResponse;
import com.unimate.domain.match.service.MatchService;
import com.unimate.global.jwt.CustomUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

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
}