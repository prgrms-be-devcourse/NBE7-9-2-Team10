package com.unimate.domain.verification.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class EmailCodeVerifyRequest {
    @Email(message = "올바른 이메일 형식이어야 합니다.")
    @NotBlank(message = "이메일은 필수입니다.")
    private String email;

    @Pattern(regexp = "^[0-9]{6}$", message = "인증코드는 6자리 숫자입니다.")
    private String code;
}
