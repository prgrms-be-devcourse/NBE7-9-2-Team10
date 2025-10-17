package com.unimate.domain.user.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unimate.domain.user.user.dto.UserSignupRequest;
import com.unimate.domain.user.user.entity.Gender;
import com.unimate.domain.user.user.repository.UserRepository;
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
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("회원가입 성공 - 모든 필드가 정상적으로 저장된다")
    void signup_success() throws Exception {
        UserSignupRequest request = new UserSignupRequest(
                "newuser@example.com",
                "password123!",
                "홍길동",
                Gender.MALE, // enum으로 변경
                LocalDate.of(2000, 5, 5),
                "Test University"
        );

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("newuser@example.com"))
                .andExpect(jsonPath("$.name").value("홍길동"));

        assertThat(userRepository.findByEmail("newuser@example.com")).isPresent();
    }

    @Test
    @DisplayName("회원가입 실패 - 중복 이메일 시 400 반환")
    void signup_fail_duplicateEmail() throws Exception {
        UserSignupRequest request = new UserSignupRequest(
                "dup@example.com",
                "password123!",
                "홍길동",
                Gender.MALE, // enum으로 변경
                LocalDate.of(2000, 5, 5),
                "Test University"
        );

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}

