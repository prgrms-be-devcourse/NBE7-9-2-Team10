package com.unimate.domain.match.entity;

public enum MatchStatus {
    PENDING("대기"),
    ACCEPTED("수락"),
    REJECTED("거절");

    private final String description;

    MatchStatus(String description) {
        this.description = description;
    }
}