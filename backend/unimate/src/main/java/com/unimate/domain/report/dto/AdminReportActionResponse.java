package com.unimate.domain.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminReportActionResponse {
    private Long reportId;
    private String newReportStatus;
    private String message;
}
