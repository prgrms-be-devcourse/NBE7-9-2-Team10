package com.unimate.domain.report.dto;

import lombok.Getter;

@Getter
public class ReportCreateRequest {
    private String reportedEmail;
    private String category;
    private String content;

}
