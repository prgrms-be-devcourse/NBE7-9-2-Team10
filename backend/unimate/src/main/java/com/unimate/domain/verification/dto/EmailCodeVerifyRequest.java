package com.unimate.domain.verification.dto;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EmailCodeVerifyRequest {
    private String email;
    private String code;
}
