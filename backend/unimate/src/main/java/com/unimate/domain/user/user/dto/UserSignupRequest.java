package com.unimate.domain.user.user.dto;

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
    private String gender;
    private LocalDate birthDate;
    private String university;
}
