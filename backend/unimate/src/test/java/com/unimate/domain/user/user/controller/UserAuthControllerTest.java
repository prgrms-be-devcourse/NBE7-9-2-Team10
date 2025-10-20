package com.unimate.domain.user.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unimate.domain.user.user.dto.UserLoginRequest;
import com.unimate.domain.user.user.dto.UserSignupRequest;
import com.unimate.domain.user.user.entity.Gender;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.domain.verification.entity.Verification;
import com.unimate.domain.verification.repository.VerificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockCookie;
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
class UserAuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VerificationRepository verificationRepository;

    @Autowired
    private UserRepository userRepository;

    private final String baseUrl = "/api/v1";
    private final String testEmail = "test@university.ac.kr";
    private final String testPassword = "password123!";

    @BeforeEach
    void setup() throws Exception {
        mockMvc.perform(post(baseUrl + "/email/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + testEmail + "\"}"))
                .andExpect(status().isOk());

        Verification v = verificationRepository.findByEmail(testEmail)
                .orElseThrow(() -> new IllegalStateException("인증 요청이 저장되지 않았습니다."));

        mockMvc.perform(post(baseUrl + "/email/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + testEmail + "\", \"code\":\"" + v.getCode() + "\"}"))
                .andExpect(status().isOk());

        assertThat(v.isVerified()).isTrue();

        UserSignupRequest signupRequest = new UserSignupRequest(
                testEmail,
                testPassword,
                "테스트유저",
                Gender.MALE,
                LocalDate.of(2000, 1, 1),
                "Test University"
        );

        mockMvc.perform(post(baseUrl + "/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        assertThat(userRepository.findByEmail(testEmail)).isPresent();
    }

    @Test
    @DisplayName("로그인 성공 시 AccessToken과 RefreshToken이 정상 발급된다")
    void login_success() throws Exception {
        UserLoginRequest loginRequest = new UserLoginRequest(testEmail, testPassword);

        mockMvc.perform(post(baseUrl + "/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("refreshToken"))
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.userId").exists())
                .andExpect(jsonPath("$.email").value(testEmail));
    }

    @Test
    @DisplayName("로그인 실패 - 비밀번호 불일치 시 401 반환")
    void login_fail_wrongPassword() throws Exception {
        UserLoginRequest loginRequest = new UserLoginRequest(testEmail, "wrongPassword");

        mockMvc.perform(post(baseUrl + "/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("RefreshToken으로 AccessToken 재발급 성공")
    void refreshToken_success() throws Exception {
        UserLoginRequest loginRequest = new UserLoginRequest(testEmail, testPassword);

        String refreshToken = mockMvc.perform(post(baseUrl + "/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getCookie("refreshToken")
                .getValue();

        mockMvc.perform(post(baseUrl + "/auth/token/refresh")
                        .cookie(new MockCookie("refreshToken", refreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
    }

    @Test
    @DisplayName("로그아웃 성공 시 RefreshToken 쿠키가 제거된다")
    void logout_success() throws Exception {
        UserLoginRequest loginRequest = new UserLoginRequest(testEmail, testPassword);

        var loginResult = mockMvc.perform(post(baseUrl + "/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String accessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("accessToken").asText();

        String refreshToken = loginResult.getResponse().getCookie("refreshToken").getValue();

        mockMvc.perform(post(baseUrl + "/auth/logout")
                        .header("Authorization", "Bearer " + accessToken)
                        .cookie(new MockCookie("refreshToken", refreshToken)))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("refreshToken", 0))
                .andExpect(jsonPath("$.message").value("로그아웃이 완료되었습니다."));
    }

    @Test
    @DisplayName("RefreshToken이 유효하지 않으면 재발급 실패")
    void refresh_fail_invalidToken() throws Exception {
        mockMvc.perform(post(baseUrl + "/auth/token/refresh")
                        .cookie(new MockCookie("refreshToken", "invalid-token")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("유효하지 않은 리프레시 토큰입니다."));
    }

}
