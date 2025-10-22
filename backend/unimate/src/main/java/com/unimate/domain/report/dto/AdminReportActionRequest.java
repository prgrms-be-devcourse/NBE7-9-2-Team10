package com.unimate.domain.report.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminReportActionRequest {
    private ActionType action;

    public enum ActionType {
        REJECT,      // 반려
        DEACTIVATE   // 강제 탈퇴
    }
}
