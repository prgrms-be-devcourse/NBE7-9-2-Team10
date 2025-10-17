package com.unimate.domain.match.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LikeResponse {
    private Long matchId;
    private boolean isMatched;
}
