package com.unimate.global.mail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("[Unimate] 이메일 인증 코드");
            message.setText("""
                    안녕하세요 😊

                    요청하신 이메일 인증 코드는 아래와 같습니다.

                    🔐 인증 코드: %s

                    본 메일은 발신 전용입니다. 10분 내에 인증을 완료해주세요.
                    """.formatted(code));
            mailSender.send(message);

            log.info("[이메일 발송 성공] email={}, code={}", to, code);
        } catch (Exception e) {
            log.error("[이메일 발송 실패] email={}", to, e);
            throw new RuntimeException("이메일 발송 중 오류가 발생했습니다.");
        }
    }
}
