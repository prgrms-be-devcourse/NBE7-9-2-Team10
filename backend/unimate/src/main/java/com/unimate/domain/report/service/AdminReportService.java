package com.unimate.domain.report.service;

import com.unimate.domain.report.dto.AdminReportActionRequest;
import com.unimate.domain.report.dto.AdminReportActionResponse;
import com.unimate.domain.report.dto.ReportDetailResponse;
import com.unimate.domain.report.dto.ReportListResponse;
import com.unimate.domain.report.dto.ReportSummary;
import com.unimate.domain.report.entity.Report;
import com.unimate.domain.report.entity.ReportStatus;
import com.unimate.domain.report.repository.ReportRepository;
import com.unimate.domain.report.repository.ReportSpecification;
import com.unimate.domain.user.admin.repository.AdminRepository;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;

    private void checkIsAdmin(Long adminId) {
        adminRepository.findById(adminId)
                .orElseThrow(() -> ServiceException.forbidden("관리자 권한이 필요합니다."));
    }

    public ReportListResponse getReports(Long adminId, Pageable pageable, String status, String keyword) {
        checkIsAdmin(adminId);
        // Specification 생성
        Specification<Report> spec = Specification.unrestricted();
        if (StringUtils.hasText(status)) {
            spec = spec.and(ReportSpecification.withStatus(ReportStatus.valueOf(status.toUpperCase())));
        }
        if (StringUtils.hasText(keyword)) {
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

    public ReportDetailResponse getReportDetail(Long adminId, Long reportId) {
        checkIsAdmin(adminId);
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> ServiceException.notFound("해당 ID의 신고를 찾을 수 없습니다: " + reportId));
        return new ReportDetailResponse(report);
    }

    @Transactional
    public AdminReportActionResponse processReportAction(Long adminId, Long reportId, AdminReportActionRequest request) {
        checkIsAdmin(adminId);
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> ServiceException.notFound("해당 ID의 신고를 찾을 수 없습니다: " + reportId));

        if (report.getReportStatus() == ReportStatus.RESOLVED || report.getReportStatus() == ReportStatus.REJECTED) {
            throw ServiceException.conflict("이미 처리된 신고입니다.");
        }

        User reportedUser = report.getReported();
        if (reportedUser == null) {
            // 이미 탈퇴 처리된 유저일 수 있으므로, 신고건만 처리
            report.updateStatus(ReportStatus.RESOLVED);
            reportRepository.save(report);
            return new AdminReportActionResponse(report.getId(), ReportStatus.RESOLVED.name(), "신고 대상자를 찾을 수 없어 신고만 처리되었습니다.");
        }

        switch (request.getAction()) {
            case REJECT:
                report.updateStatus(ReportStatus.REJECTED);
                reportRepository.save(report);
                return new AdminReportActionResponse(report.getId(), ReportStatus.REJECTED.name(), "신고가 반려 처리되었습니다.");

            case DEACTIVATE:
                report.updateStatus(ReportStatus.RESOLVED);
                reportRepository.save(report);
                userRepository.delete(reportedUser);
                return new AdminReportActionResponse(report.getId(), ReportStatus.RESOLVED.name(), "신고 대상자 계정이 강제 탈퇴 처리되었습니다.");

            default:
                throw ServiceException.badRequest("유효하지 않은 요청입니다.");
        }
    }
}
