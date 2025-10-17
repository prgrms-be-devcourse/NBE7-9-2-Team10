package com.unimate.domain.user.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unimate.domain.user.user.dto.UserSignupRequest;
import com.unimate.domain.user.user.entity.Gender;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.domain.verification.entity.Verification;
import com.unimate.domain.verification.repository.VerificationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VerificationRepository verificationRepository;

    private final String testEmail = "student@university.ac.kr";
    private final String baseUrl = "/api/v1";

    @Test
    @DisplayName("회원가입 성공 - 이메일 인증 후 회원가입이 정상적으로 수행된다")
    void signup_success_afterEmailVerification() throws Exception {
        mockMvc.perform(post(baseUrl + "/email/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + testEmail + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("인증코드가 발송되었습니다."));

        Verification verification = verificationRepository.findByEmail(testEmail)
                .orElseThrow(() -> new IllegalStateException("인증 요청이 DB에 저장되지 않았습니다."));

        mockMvc.perform(post(baseUrl + "/email/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + testEmail + "\", \"code\":\"" + verification.getCode() + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("이메일 인증이 완료되었습니다."));

        assertThat(verification.isVerified()).isTrue();

        UserSignupRequest request = new UserSignupRequest(
                testEmail,
                "password123!",
                "홍길동",
                Gender.MALE, // enum으로 변경
                LocalDate.of(2000, 5, 5),
                "Test University"
        );

        mockMvc.perform(post(baseUrl + "/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(testEmail))
                .andExpect(jsonPath("$.name").value("홍길동"));

        assertThat(userRepository.findByEmail(testEmail)).isPresent();
        assertThat(userRepository.findByEmail(testEmail).get().getStudentVerified()).isTrue();
    }

    @Test
    @DisplayName("회원가입 실패 - 이메일 인증 없이 시도 시 400 반환")
    void signup_fail_withoutVerification() throws Exception {
        UserSignupRequest request = new UserSignupRequest(
                "unverified@university.ac.kr",
                "password123!",
                "미인증유저",
                "FEMALE",
                LocalDate.of(1999, 3, 3),
                "Test University"
        );

        mockMvc.perform(post(baseUrl + "/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("이메일 인증이 필요합니다."));
    }

    @Test
    @DisplayName("회원가입 실패 - 이미 가입된 이메일일 경우 400 반환")
    void signup_fail_duplicateEmail() throws Exception {
        mockMvc.perform(post(baseUrl + "/email/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"dup@university.ac.kr\"}"))
                .andExpect(status().isOk());

        Verification verification = verificationRepository.findByEmail("dup@university.ac.kr")
                .orElseThrow();
        mockMvc.perform(post(baseUrl + "/email/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"dup@university.ac.kr\", \"code\":\"" + verification.getCode() + "\"}"))
                .andExpect(status().isOk());

        UserSignupRequest request = new UserSignupRequest(
                "dup@university.ac.kr",
                "password123!",
                "홍길동",
                Gender.MALE, // enum으로 변경
                LocalDate.of(2000, 5, 5),
                "Test University"
        );

        mockMvc.perform(post(baseUrl + "/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(post(baseUrl + "/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("이미 가입된 이메일입니다."));
    }
}
