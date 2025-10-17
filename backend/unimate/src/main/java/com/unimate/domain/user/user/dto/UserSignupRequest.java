package com.unimate.domain.user.user.dto;

import com.unimate.domain.user.user.entity.Gender;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserSignupRequest {
    private String email;
    private String password;
    private String name;
    private Gender gender; // 변경
    private LocalDate birthDate;
    private String university;
}
