package com.unimate.domain.report.controller;


import com.unimate.domain.report.dto.ReportDetailResponse;
import com.unimate.domain.report.dto.ReportListResponse;
import com.unimate.domain.report.service.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping
    public ResponseEntity<ReportListResponse> getReports(
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        ReportListResponse response = adminReportService.getReports(pageable, status, keyword);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<ReportDetailResponse> getReportDetail(@PathVariable Long reportId) {
        ReportDetailResponse response = adminReportService.getReportDetail(reportId);
        return ResponseEntity.ok(response);
    }

}
