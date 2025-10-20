package com.unimate.domain.match.dto;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchRecommendationRequest {
    
    @Pattern(regexp = "^(early|normal|late)$", message = "수면 패턴은 early, normal, late 중 하나여야 합니다")
    private String sleepPattern;
    
    @Pattern(regexp = "^(20-25|26-30|31-35|36\\+)$", message = "나이대는 20-25, 26-30, 31-35, 36+ 중 하나여야 합니다")
    private String ageRange;
    
    @Pattern(regexp = "^(daily|weekly|monthly)$", message = "청소 빈도는 daily, weekly, monthly 중 하나여야 합니다")
    private String cleaningFrequency;
    
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;
    
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;
}
