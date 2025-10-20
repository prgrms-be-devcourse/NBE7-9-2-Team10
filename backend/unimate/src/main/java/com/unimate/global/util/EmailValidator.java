package com.unimate.global.util;

public class EmailValidator {
    public static boolean isSchoolEmail(String email) {
        return email != null && email.endsWith(".ac.kr");
    }
}