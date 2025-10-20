package com.unimate.domain.user.adminUser.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminLoginRequest {
    private String email;
    private String password;
}

