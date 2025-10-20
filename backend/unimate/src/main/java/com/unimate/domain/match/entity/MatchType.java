package com.unimate.domain.match.entity;

public enum MatchType {
    LIKE("좋아요"),
    REQUEST("정식 룸메 신청");

    private final String description;

    MatchType(String description) {
        this.description = description;
    }
}