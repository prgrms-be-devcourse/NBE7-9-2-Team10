package com.unimate.domain.match.entity;

public enum MatchStatus {
    NONE("관계 없음"),
    PENDING("대기"),
    ACCEPTED("수락"),
    REJECTED("거절");

    private final String description;

    MatchStatus(String description) {
        this.description = description;
    }
}