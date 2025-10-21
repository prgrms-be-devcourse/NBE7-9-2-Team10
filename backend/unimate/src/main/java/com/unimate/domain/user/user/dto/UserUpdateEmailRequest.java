package com.unimate.domain.user.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserUpdateEmailRequest {

    @NotBlank
    @Email
    private String newEmail;

    @NotBlank
    private String code;
}
