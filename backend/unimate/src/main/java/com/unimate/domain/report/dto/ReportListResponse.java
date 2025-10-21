package com.unimate.domain.report.dto;

import com.unimate.domain.report.entity.Report;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ReportListResponse {
    private List<ReportSummary> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
