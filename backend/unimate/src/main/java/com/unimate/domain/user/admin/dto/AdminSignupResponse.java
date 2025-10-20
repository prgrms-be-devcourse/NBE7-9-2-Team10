package com.unimate.domain.user.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminSignupResponse {
    private Long id;
    private String email;
    private String name;
}
