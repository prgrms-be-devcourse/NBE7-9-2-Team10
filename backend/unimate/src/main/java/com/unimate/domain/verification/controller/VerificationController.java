package com.unimate.domain.verification.controller;

import com.unimate.domain.verification.dto.EmailCodeVerifyRequest;
import com.unimate.domain.verification.dto.EmailVerificationRequest;
import com.unimate.domain.verification.service.VerificationService;
import com.unimate.global.auth.dto.MessageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/email")
@Validated
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping("/request")
    public ResponseEntity<MessageResponse> request(@Valid @RequestBody EmailVerificationRequest request) {
        verificationService.sendVerificationCode(request.getEmail());
        return ResponseEntity.ok(new MessageResponse("인증코드가 발송되었습니다."));
    }

    @PostMapping("/verify")
    public ResponseEntity<MessageResponse> verify(@Valid @RequestBody EmailCodeVerifyRequest request) {
        verificationService.verifyCode(request.getEmail(), request.getCode());
        return ResponseEntity.ok(new MessageResponse("이메일 인증이 완료되었습니다."));
    }
}
