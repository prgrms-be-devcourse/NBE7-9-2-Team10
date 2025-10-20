package com.unimate.domain.match.controller;

import com.unimate.domain.match.dto.*;
import com.unimate.domain.match.entity.Match;
import com.unimate.domain.match.service.MatchService;
import com.unimate.domain.match.service.MatchUtilityService;
import com.unimate.global.jwt.CustomUserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;
    private final MatchUtilityService matchUtilityService;

    /**
     * 룸메이트 추천 목록 조회 (필터 적용)
     */
    @GetMapping("/recommendations")
    public ResponseEntity<MatchRecommendationResponse> getMatchRecommendations(
            @AuthenticationPrincipal CustomUserPrincipal user,
            // 사용자 선택 필터들
            @RequestParam(value = "sleepPattern", required = false) String sleepPattern,
            @RequestParam(value = "ageRange", required = false) String ageRange,
            @RequestParam(value = "cleaningFrequency", required = false) String cleaningFrequency,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        MatchRecommendationResponse response = matchService.getMatchRecommendations(
                user.getEmail(),
                sleepPattern,
                ageRange,
                cleaningFrequency,
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
            @PathVariable("receiverId") Long receiverId,
            @AuthenticationPrincipal CustomUserPrincipal user
    ) {
        MatchRecommendationDetailResponse response =
                matchService.getMatchRecommendationDetail(user.getEmail(), receiverId);
        return ResponseEntity.ok(response);
    }

    /**
     * 룸메이트 최종 확정/거절
     */
    @PutMapping("/{id}/confirm")
    public ResponseEntity<MatchConfirmResponse> confirmMatch(
            @PathVariable("id") Long id,
            @RequestParam(value = "action") String action,
            @AuthenticationPrincipal CustomUserPrincipal user
    ) {
        return switch (action) {
            case "accept" -> {
                Match match = matchService.confirmMatch(id, user.getUserId());
                yield ResponseEntity.ok(buildMatchConfirmResponse(match, "룸메이트 매칭이 최종 확정되었습니다."));
            }
            case "reject" -> {
                Match match = matchService.rejectMatch(id, user.getUserId());
                yield ResponseEntity.ok(buildMatchConfirmResponse(match, "룸메이트 매칭이 거절되었습니다."));
            }
            default -> ResponseEntity.badRequest().build();
        };
    }

    /**
     * 매칭 상태 조회
     * 사용자의 모든 매칭 상태를 조회 (PENDING, ACCEPTED, REJECTED)
     */
    @GetMapping("/status")
    public ResponseEntity<MatchStatusResponse> getMatchStatus(
            @AuthenticationPrincipal CustomUserPrincipal user
    ) {
        MatchStatusResponse response = matchService.getMatchStatus(user.getUserId());
        return ResponseEntity.ok(response);
    }

    /**
     * 룸메이트 성사 결과
     * 성사된 매칭 결과만 조회 (ACCEPTED 상태)
     */
    @GetMapping("/results")
    public ResponseEntity<MatchResultResponse> getMatchResults(
            @AuthenticationPrincipal CustomUserPrincipal user
    ) {
        MatchResultResponse response = matchService.getMatchResults(user.getUserId());
        return ResponseEntity.ok(response);
    }

    /**
     * 좋아요 보내기
     */
    @PostMapping("/likes")
    public ResponseEntity<LikeResponse> sendLike(
            @Valid @RequestBody LikeRequest requestDto,
            @AuthenticationPrincipal CustomUserPrincipal user) {

        LikeResponse response = matchService.sendLike(requestDto, user.getUserId());
        return ResponseEntity.ok(response);
    }

    /**
     * 좋아요 취소
     */
    @DeleteMapping("/{receiverId}")
    public ResponseEntity<Void> cancelLike(
            @PathVariable Long receiverId,
            @AuthenticationPrincipal CustomUserPrincipal user) {

        matchService.cancelLike(user.getUserId(), receiverId);
        return ResponseEntity.noContent().build();
    }


    // 매칭 확정 응답 생성 헬퍼 메서드
    private MatchConfirmResponse buildMatchConfirmResponse(Match match, String message) {
        return MatchConfirmResponse.builder()
                .id(match.getId())
                .senderId(match.getSender().getId())
                .receiverId(match.getReceiver().getId())
                .matchType(match.getMatchType())
                .matchStatus(match.getMatchStatus())
                .preferenceScore(match.getPreferenceScore())
                .confirmedAt(match.getConfirmedAt())
                .message(message)
                .sender(MatchConfirmResponse.SenderInfo.builder()
                        .id(match.getSender().getId())
                        .name(match.getSender().getName())
                        .email(match.getSender().getEmail())
                        .university(match.getSender().getUniversity())
                        .build())
                .receiver(MatchConfirmResponse.ReceiverInfo.builder()
                        .id(match.getReceiver().getId())
                        .name(match.getReceiver().getName())
                        .age(matchUtilityService.calculateAge(match.getReceiver().getBirthDate()))
                        .university(match.getReceiver().getUniversity())
                        .email(match.getReceiver().getEmail())
                        .build())
                .build();
    }
}
