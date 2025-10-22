package com.unimate.global.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.BeanWrapperImpl;

import java.time.LocalDate;

public class DateRangeValidator implements ConstraintValidator<ValidDateRange, Object> {

    private String startDate;
    private String endDate;

    @Override
    public void initialize(ValidDateRange constraintAnnotation) {
        this.startDate = constraintAnnotation.startDate();
        this.endDate = constraintAnnotation.endDate();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        Object startDateValue = new BeanWrapperImpl(value).getPropertyValue(startDate);
        Object endDateValue = new BeanWrapperImpl(value).getPropertyValue(endDate);

        if (startDateValue == null || endDateValue == null) {
            return true; // @NotNull annotation should handle this
        }

        if (startDateValue instanceof LocalDate && endDateValue instanceof LocalDate) {
            return !((LocalDate) startDateValue).isAfter((LocalDate) endDateValue);
        }

        return false;
    }
}
