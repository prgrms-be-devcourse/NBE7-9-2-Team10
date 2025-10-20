package com.unimate.domain.user.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminLoginResponse {
    private Long adminId;
    private String email;
    private String accessToken;
}