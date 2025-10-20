package com.unimate.domain.user.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserLoginResponse {
    private Long userId;
    private String email;
    private String accessToken;
}
