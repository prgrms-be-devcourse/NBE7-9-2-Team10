package com.unimate.domain.user.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    @Email(message = "올바른 이메일 형식이어야 합니다.")
    @NotBlank(message = "이메일은 필수입니다.")
    private String email;
    @NotBlank(message = "이름은 필수입니다.")
    private String name;
    @NotNull(message = "생년월일은 필수입니다.")
    private LocalDate birthDate;
    @NotBlank(message = "대학교는 필수입니다.")
    private String university;
}
