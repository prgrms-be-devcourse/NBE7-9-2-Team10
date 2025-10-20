package com.unimate.global.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class Tokens {
    private final Long subjectId;
    private final String email;
    private final String accessToken;
    private final String refreshToken;

    public static Tokens of(Long subjectId, String email, String accessToken, String refreshToken) {
        return Tokens.builder()
                .subjectId(subjectId)
                .email(email)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}

