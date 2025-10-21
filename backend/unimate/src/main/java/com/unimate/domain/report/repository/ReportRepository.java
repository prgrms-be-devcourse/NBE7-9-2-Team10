package com.unimate.domain.report.repository;

import com.unimate.domain.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ReportRepository extends JpaRepository<Report, Long>, JpaSpecificationExecutor<Report> {


}
