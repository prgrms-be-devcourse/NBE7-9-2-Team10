package com.unimate.domain.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ReportSummary {
    private Long reportId;
    private String reporterName;
    private String reportedName;
    private String category;
    private String status;
    private LocalDateTime createdAt;
}
