package com.unimate.domain.user.user.dto;

import com.unimate.domain.user.user.entity.Gender;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class UserUpdateResponse {
    private String email;
    private String name;
    private LocalDate birthDate;
    private Gender gender;
    private String university;
}
