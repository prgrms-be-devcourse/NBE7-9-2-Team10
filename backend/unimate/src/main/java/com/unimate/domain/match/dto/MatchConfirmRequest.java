package com.unimate.domain.match.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchConfirmRequest {
    
    @NotBlank(message = "액션은 필수입니다")
    @Pattern(regexp = "^(accept|reject)$", message = "액션은 accept 또는 reject여야 합니다")
    private String action;
}
