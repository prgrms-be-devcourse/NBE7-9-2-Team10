package com.unimate.domain.match.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchRecommendationRequest {
    
    @Pattern(
        regexp = "^(very_early|early|normal|late|very_late)$",
        message = "수면 패턴은 very_early, early, normal, late, very_late 중 하나여야 합니다."
    )
    private String sleepPattern;
    
    @Pattern(regexp = "^(20-22|23-25|26-28|28-30|30\\+)$", message = "나이대는 20-22, 23-25, 26-28, 28-30, 30+ 중 하나여야 합니다")
    private String ageRange;

    @Pattern(
            regexp = "^(rarely|monthly|weekly|several_times_weekly|daily)$",
            message = "청소 빈도는 rarely, monthly, weekly, several_times_weekly, daily 중 하나여야 합니다."
    )
    private String cleaningFrequency;
    
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;
    
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;
}

