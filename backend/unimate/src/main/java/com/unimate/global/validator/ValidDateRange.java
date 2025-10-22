package com.unimate.global.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = DateRangeValidator.class)
@Target({ ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidDateRange {
    String message() default "룸메이트 종료일은 시작일보다 빠를 수 없습니다.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    String startDate();
    String endDate();
}
