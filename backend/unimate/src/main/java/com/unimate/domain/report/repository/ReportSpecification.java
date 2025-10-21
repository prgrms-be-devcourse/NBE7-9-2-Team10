package com.unimate.domain.report.repository;

import com.unimate.domain.report.entity.Report;
import com.unimate.domain.report.entity.ReportStatus;
import com.unimate.domain.user.user.entity.User;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public class ReportSpecification {

    public static Specification<Report> withStatus(ReportStatus status) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("reportStatus"), status);
    }

    public static Specification<Report> withKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            String pattern = "%" + keyword + "%";

            // reporter, reported User 테이블하고 조인
            Join<Report, User> reporterJoin = root.join("reporter");
            Join<Report, User> reportedJoin = root.join("reported");

            // 검색 조건: 신고자 이름, 피신고자 이름, 신고 내용
            return criteriaBuilder.or(
                    criteriaBuilder.like(reporterJoin.get("name"), pattern),
                    criteriaBuilder.like(reportedJoin.get("name"), pattern),
                    criteriaBuilder.like(root.get("content"), pattern)
            );
        };
    }

}
