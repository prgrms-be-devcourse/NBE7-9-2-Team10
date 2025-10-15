package com.unimate.domain.report.dto;

import com.unimate.domain.report.entity.ReportStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReportResponse {
    private Long          reportId;
    private String        reporterEmail;
    private String        reportedEmail;
    private String        category;
    private String        content;
    private ReportStatus  reportStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
