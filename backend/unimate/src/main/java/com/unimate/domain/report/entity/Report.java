package com.unimate.domain.report.entity;

import com.unimate.domain.user.user.entity.User;
import com.unimate.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "report")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Report extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporterId")
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reportedId")
    private User reported;

    private String  category;
    @Lob //TEXT
    private String  content;
    @Enumerated(EnumType.STRING)
    private ReportStatus reportStatus;

    @Builder
    private Report(User reporter,
                   User reported,
                   String category,
                   String content,
                   ReportStatus reportStatus) {
        this.reporter = reporter;
        this.reported = reported;
        this.category     = category;
        this.content      = content;
        this.reportStatus = (reportStatus != null)
                ? reportStatus
                : ReportStatus.RECEIVED;
    }

    public void updateStatus(ReportStatus status) {
        this.reportStatus = status;
    }

//    public void update(String category, String content) {
//        this.category = category;
//        this.content  = content;
//    }
}
