package com.unimate.domain.verification.service;

import com.unimate.domain.verification.entity.Verification;
import com.unimate.domain.verification.repository.VerificationRepository;
import com.unimate.global.exception.ServiceException;
import com.unimate.global.mail.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationService {

    private final VerificationRepository verificationRepository;
    private final EmailService emailService;

    @Transactional
    public void sendVerificationCode(String email) {
        validateSchoolEmail(email);
        String code = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1_000_000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

        verificationRepository.findByEmail(email)
                .ifPresentOrElse(
                        v -> v.updateCode(code, expiresAt),
                        () -> verificationRepository.save(new Verification(email, code, expiresAt))
                );

        emailService.sendVerificationEmail(email, code);
    }

    @Transactional
    public void verifyCode(String email, String code) {
        Verification v = verificationRepository.findByEmail(email)
                .orElseThrow(() -> ServiceException.notFound("인증 요청 기록이 없습니다."));

        if (v.isExpired()) throw ServiceException.badRequest("인증코드가 만료되었습니다.");
        if (!v.getCode().equals(code)) throw ServiceException.badRequest("인증코드가 올바르지 않습니다.");

        v.markVerified();
        log.info("[이메일 인증 성공] email={}", email);
    }

    public void assertVerifiedEmailOrThrow(String email) {
        Verification v = verificationRepository.findByEmail(email)
                .orElseThrow(() -> ServiceException.badRequest("이메일 인증이 필요합니다."));
        if (!v.isVerified()) throw ServiceException.badRequest("이메일 인증이 완료되지 않았습니다.");
        if (v.isExpired()) throw ServiceException.badRequest("인증코드가 만료되었습니다. 다시 요청해주세요.");
    }

    @Transactional
    public void consumeVerification(String email) {
        verificationRepository.deleteByEmail(email);
    }

    private void validateSchoolEmail(String email) {
        if (email == null || !email.endsWith(".ac.kr")) {
            throw ServiceException.badRequest("학교 이메일만 인증 가능합니다.");
        }
    }
}