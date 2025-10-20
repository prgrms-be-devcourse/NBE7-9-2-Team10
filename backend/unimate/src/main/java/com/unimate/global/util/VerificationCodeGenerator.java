package com.unimate.global.util;

import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

@Component
public class VerificationCodeGenerator {
    public static String generate6Digits() {
        return String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1_000_000));
    }
}