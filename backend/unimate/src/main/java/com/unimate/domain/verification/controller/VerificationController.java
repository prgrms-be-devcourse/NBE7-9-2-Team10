package com.unimate.domain.verification.controller;

import com.unimate.domain.verification.dto.EmailVerificationRequest;
import com.unimate.domain.verification.dto.EmailCodeVerifyRequest;
import com.unimate.domain.verification.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth/email")
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping("/request")
    public ResponseEntity<?> request(@RequestBody EmailVerificationRequest request) {
        verificationService.sendVerificationCode(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "인증코드가 발송되었습니다."));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody EmailCodeVerifyRequest request) {
        verificationService.verifyCode(request.getEmail(), request.getCode());
        return ResponseEntity.ok(Map.of("message", "이메일 인증이 완료되었습니다."));
    }
}