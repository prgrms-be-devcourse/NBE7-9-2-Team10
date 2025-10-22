package com.unimate.domain.user.user.dto;

import com.unimate.domain.user.user.entity.Gender;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class UserUpdateEmailResponse {
    private String email;
    private String name;
    private Gender gender;
    private LocalDate birthDate;
    private String university;
    private String accessToken;
}