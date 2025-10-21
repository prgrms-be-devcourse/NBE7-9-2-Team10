package com.unimate.domain.report.service;

import com.unimate.domain.report.dto.ReportDetailResponse;
import com.unimate.domain.report.dto.ReportListResponse;
import com.unimate.domain.report.dto.ReportResponse;
import com.unimate.domain.report.dto.ReportSummary;
import com.unimate.domain.report.entity.Report;
import com.unimate.domain.report.entity.ReportStatus;
import com.unimate.domain.report.repository.ReportRepository;
import com.unimate.domain.report.repository.ReportSpecification;
import com.unimate.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import static org.springframework.data.jpa.domain.Specification.unrestricted;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReportService {

    private final ReportRepository reportRepository;

    public ReportListResponse getReports(Pageable pageable, String status, String keyword) {

        // Specification 생성
        Specification<Report> spec = Specification.unrestricted();
        if(StringUtils.hasText(status)) {
            spec = spec.and(ReportSpecification.withStatus(ReportStatus.valueOf(status.toUpperCase())));
        }
        if(StringUtils.hasText(keyword)) {
            spec = spec.and(ReportSpecification.withKeyword(keyword));
        }

        Page<Report> reportPage = reportRepository.findAll(spec, pageable);

        Page<ReportSummary> dtoPage = reportPage.map(report -> new ReportSummary(
                report.getId(),
                report.getReporter() != null ? report.getReporter().getName() : "탈퇴한 사용자",
                report.getReported() != null ? report.getReported().getName() : "탈퇴한 사용자",
                report.getCategory(),
                report.getReportStatus().name(),
                report.getCreatedAt()
        ));

        return new ReportListResponse(
                dtoPage.getContent(),
                dtoPage.getNumber(),
                dtoPage.getSize(),
                dtoPage.getTotalElements(),
                dtoPage.getTotalPages()
        );

    }

    public ReportDetailResponse getReportDetail(Long reportId) {

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> ServiceException.notFound("해당 ID의 신고를 찾을 수 없습니다: " + reportId));

        return new ReportDetailResponse(report);
    }
}
