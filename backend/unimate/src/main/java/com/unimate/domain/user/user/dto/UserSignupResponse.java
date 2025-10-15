package com.unimate.domain.user.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UserSignupResponse {
    private Long userId;
    private String email;
    private String name;
}