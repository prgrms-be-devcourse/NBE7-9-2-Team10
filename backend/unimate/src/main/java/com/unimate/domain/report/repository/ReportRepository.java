package com.unimate.domain.report.repository;

import com.unimate.domain.report.entity.Report;
import com.unimate.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long>, JpaSpecificationExecutor<Report> {
    List<Report> findByReporterOrReported(User reporter, User reported);
}
