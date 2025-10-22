package com.unimate.domain.userMatchPreference.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.unimate.domain.userMatchPreference.entity.UserMatchPreference;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@JsonPropertyOrder({
        "userId",
        "startUseDate",
        "endUseDate",
        "sleepTime",
        "isPetAllowed",
        "isSmoker",
        "cleaningFrequency",
        "preferredAgeGap",
        "hygieneLevel",
        "isSnoring",
        "drinkingFrequency",
        "noiseSensitivity",
        "guestFrequency",
        "updatedAt"
})
public class MatchPreferenceResponse {
    private Long userId;
    private LocalDate startUseDate;
    private LocalDate endUseDate;
    private Integer sleepTime;

    private boolean isPetAllowed;

    private boolean isSmoker;
    private Integer cleaningFrequency;
    private Integer preferredAgeRange;
    private Integer hygieneLevel;

    private boolean isSnoring;
    private Integer drinkingFrequency;
    private Integer noiseSensitivity;
    private Integer guestFrequency;
    private LocalDateTime updatedAt;

    // json이 필드명 접두사에 있는 is를 무시해서, 별도로 선언.
    @JsonProperty("isPetAllowed")
    public boolean isPetAllowed() {
        return isPetAllowed;
    }

    @JsonProperty("isSmoker")
    public boolean isSmoker() {
        return isSmoker;
    }

    @JsonProperty("isSnoring")
    public boolean isSnoring() {
        return isSnoring;
    }



    private MatchPreferenceResponse(UserMatchPreference userMatchPreference) {
        this.userId = userMatchPreference.getUser().getId();
        this.startUseDate = userMatchPreference.getStartUseDate();
        this.endUseDate = userMatchPreference.getEndUseDate();
        this.sleepTime = userMatchPreference.getSleepTime();
        this.isPetAllowed = userMatchPreference.getIsPetAllowed();
        this.isSmoker = userMatchPreference.getIsSmoker();
        this.cleaningFrequency = userMatchPreference.getCleaningFrequency();
        this.preferredAgeRange = userMatchPreference.getPreferredAgeRange();
        this.hygieneLevel = userMatchPreference.getHygieneLevel();
        this.isSnoring = userMatchPreference.getIsSnoring();
        this.drinkingFrequency = userMatchPreference.getDrinkingFrequency();
        this.noiseSensitivity = userMatchPreference.getNoiseSensitivity();
        this.guestFrequency = userMatchPreference.getGuestFrequency();
        this.updatedAt = userMatchPreference.getUpdatedAt();
    }

    // 팩토리 메서드
    public static MatchPreferenceResponse fromEntity(UserMatchPreference userMatchPreference) {
        return new MatchPreferenceResponse(userMatchPreference);
    }

}
