package com.unimate.domain.report.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.report.entity.Report;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ReportDetailResponse {
    private final Long reportId;
    private final UserInfo reporterInfo;
    private final UserInfo reportedInfo;
    private final String category;
    private final String content;
    private final String status;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public ReportDetailResponse(Report report) {
        this.reportId = report.getId();
        this.reporterInfo = new UserInfo(report.getReporter());
        this.reportedInfo = new UserInfo(report.getReported());
        this.category = report.getCategory();
        this.content = report.getContent();
        this.status = report.getReportStatus().name();
        this.createdAt = report.getCreatedAt();
        this.updatedAt = report.getUpdatedAt();
    }

    @Getter
    public static class UserInfo {
        private final Long userId;
        private final String name;
        private final String email;
        private final String university;

        public UserInfo(User user) {
            if (user != null) {
                this.userId = user.getId();
                this.name = user.getName();
                this.email = user.getEmail();
                this.university = user.getUniversity();
            } else {
                this.userId = null;
                this.name = "탈퇴한 사용자";
                this.email = "N/A";
                this.university = "N/A";
            }
        }
    }

}
