package com.unimate.domain.userMatchPreference.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class MatchPreferenceRequest {

    private static final int MIN_PREFERENCE_LEVEL = 1;
    private static final int MAX_PREFERENCE_LEVEL = 5;
    private static final int MIN_AGE_GAP = 0;
    private static final int MAX_AGE_GAP = 10;

    @NotNull(message = "startUseDate 필드는 null일 수 없습니다.")
    @FutureOrPresent(message = "startUseDate는 현재 또는 미래의 날짜여야 합니다.")
    private LocalDate startUseDate; // 룸메이트 시작 기간

    @NotNull(message = "endUseDate 필드는 null일 수 없습니다.")
    @Future(message = "endUseDate는 미래의 날짜여야 합니다.")
    private LocalDate endUseDate; // 룸메이트 종료 기간

    @NotNull(message = "sleepTime 필드는 null일 수 없습니다.")
    @Min(value = MIN_PREFERENCE_LEVEL, message = "sleepTime은 " + MIN_PREFERENCE_LEVEL + " 이상의 값이어야 합니다.")
    @Max(value = MAX_PREFERENCE_LEVEL, message = "sleepTime은 " + MAX_PREFERENCE_LEVEL + " 이하의 값이어야 합니다.") // 기획에 따라 범위 조절
    private Integer sleepTime; // 취침 시간대

    @NotNull(message = "isPetAllowed 필드는 null일 수 없습니다.")
    @JsonProperty("isPetAllowed")
    private Boolean petAllowed; // 반려동물 허용 여부

    @NotNull(message = "isSmoker 필드는 null일 수 없습니다.")
    @JsonProperty("isSmoker")
    private Boolean smoker; // 흡연 허용 여부

    @NotNull(message = "cleaningFrequency 필드는 null일 수 없습니다.")
    @Min(value = MIN_PREFERENCE_LEVEL, message = "cleaningFrequency은 " + MIN_PREFERENCE_LEVEL + " 이상의 값이어야 합니다.")
    @Max(value = MAX_PREFERENCE_LEVEL, message = "cleaningFrequency은 " + MAX_PREFERENCE_LEVEL + " 이하의 값이어야 합니다.") // 기획에 따라 범위 조절
    private Integer cleaningFrequency; // 선호하는 청소 빈도

    @NotNull(message = "preferredAgeGap 필드는 null일 수 없습니다.")
    @Min(value = MIN_AGE_GAP, message = "preferredAgeGap은 " + MIN_AGE_GAP + " 이상의 값이어야 합니다.")
    @Max(value = MAX_AGE_GAP, message = "preferredAgeGap은 " + MAX_AGE_GAP + " 이하의 값이어야 합니다.") // 기획에 따라 범위 조절
    private Integer preferredAgeGap; // 선호하는 나이 차이

    @NotNull(message = "hygieneLevel 필드는 null일 수 없습니다.")
    @Min(value = MIN_PREFERENCE_LEVEL, message = "hygieneLevel은 " + MIN_PREFERENCE_LEVEL + " 이상의 값이어야 합니다.")
    @Max(value = MAX_PREFERENCE_LEVEL, message = "hygieneLevel은 " + MAX_PREFERENCE_LEVEL + " 이하의 값이어야 합니다.") // 기획에 따라 범위 조절
    private Integer hygieneLevel; // 선호하는 위생 수준

    @NotNull(message = "isSnoring 필드는 null일 수 없습니다.")
    @JsonProperty("isSnoring")
    private Boolean snoring; // 코골이 허용 여부

    @NotNull(message = "drinkingFrequency 필드는 null일 수 없습니다.")
    @Min(value = MIN_PREFERENCE_LEVEL, message = "drinkingFrequency은 " + MIN_PREFERENCE_LEVEL + " 이상의 값이어야 합니다.")
    @Max(value = MAX_PREFERENCE_LEVEL, message = "drinkingFrequency은 " + MAX_PREFERENCE_LEVEL + " 이하의 값이어야 합니다.") // 기획에 따라 범위 조절
    private Integer drinkingFrequency; // 선호하는 음주 빈도

    @NotNull(message = "noiseSensitivity 필드는 null일 수 없습니다.")
    @Min(value = MIN_PREFERENCE_LEVEL, message = "noiseSensitivity은 " + MIN_PREFERENCE_LEVEL + " 이상의 값이어야 합니다.")
    @Max(value = MAX_PREFERENCE_LEVEL, message = "noiseSensitivity은 " + MAX_PREFERENCE_LEVEL + " 이하의 값이어야 합니다.") // 기획에 따라 범위 조절
    private Integer noiseSensitivity; // 선호하는 소음 민감도

    @NotNull(message = "guestFrequency 필드는 null일 수 없습니다.")
    @Min(value = MIN_PREFERENCE_LEVEL, message = "guestFrequency은 " + MIN_PREFERENCE_LEVEL + " 이상의 값이어야 합니다.")
    @Max(value = MAX_PREFERENCE_LEVEL, message = "guestFrequency은 " + MAX_PREFERENCE_LEVEL + " 이하의 값이어야 합니다.") // 기획에 따라 범위 조절
    private Integer guestFrequency; // 선호하는 방문자 빈도
}
