package com.unimate.domain.report.controller;

import com.unimate.domain.report.dto.ReportCreateRequest;
import com.unimate.domain.report.dto.ReportResponse;
import com.unimate.domain.report.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ReportResponse> create(
            @Valid @RequestBody ReportCreateRequest rq,
            @AuthenticationPrincipal(expression = "claims['email']") String email
    ){
        ReportResponse res = reportService.create(email, rq);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

}
