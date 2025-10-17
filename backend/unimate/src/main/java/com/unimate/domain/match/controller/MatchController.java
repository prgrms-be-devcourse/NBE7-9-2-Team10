package com.unimate.domain.match.controller;

import com.unimate.domain.match.dto.LikeRequest;
import com.unimate.domain.match.dto.LikeResponse;
import com.unimate.domain.match.service.MatchService;
import com.unimate.global.jwt.CustomUserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/likes")
public class MatchController {

    private final MatchService matchService;

    @PostMapping
    public ResponseEntity<LikeResponse> sendLike(
            @Valid @RequestBody LikeRequest requestDto,
            @AuthenticationPrincipal CustomUserPrincipal user) {

        LikeResponse response = matchService.sendLike(requestDto, user.getUserId());
        return ResponseEntity.ok(response);
    }
}
