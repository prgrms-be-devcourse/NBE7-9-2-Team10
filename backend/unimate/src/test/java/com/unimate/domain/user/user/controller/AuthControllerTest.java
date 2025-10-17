package com.unimate.domain.user.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unimate.domain.user.user.dto.LoginRequest;
import com.unimate.domain.user.user.dto.UserSignupRequest;
import com.unimate.domain.user.user.entity.Gender;
import com.unimate.domain.user.user.repository.UserRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private final String baseUrl = "/auth";

    @BeforeEach
    void setup() throws Exception {
        UserSignupRequest signupRequest = new UserSignupRequest(
                "test@example.com",
                "password123!",
                "테스트유저",
                Gender.MALE, // enum으로 변경
                LocalDate.of(2000, 1, 1),
                "Test University"
        );

        mockMvc.perform(post(baseUrl + "/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("로그인 성공 시 AccessToken과 RefreshToken이 정상 발급된다")
    void login_success() throws Exception {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password123!");

        mockMvc.perform(post(baseUrl + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("refreshToken"))
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.userId").exists())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    @DisplayName("로그인 실패 - 비밀번호 불일치 시 401 반환")
    void login_fail_wrongPassword() throws Exception {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "wrongPassword");

        mockMvc.perform(post(baseUrl + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("RefreshToken으로 AccessToken 재발급 성공")
    void refreshToken_success() throws Exception {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password123!");

        String refreshToken = mockMvc.perform(post(baseUrl + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getCookie("refreshToken")
                .getValue();

        mockMvc.perform(post(baseUrl + "/token/refresh")
                        .cookie(new MockCookie("refreshToken", refreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
    }

    @Test
    @DisplayName("로그아웃 성공 시 RefreshToken 쿠키가 제거된다")
    void logout_success() throws Exception {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password123!");

        String refreshToken = mockMvc.perform(post(baseUrl + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn()
                .getResponse()
                .getCookie("refreshToken")
                .getValue();

        mockMvc.perform(post(baseUrl + "/logout")
                        .cookie(new MockCookie("refreshToken", refreshToken)))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("refreshToken", 0))
                .andExpect(jsonPath("$.message").value("로그아웃이 완료되었습니다."));
    }
}

