package com.unimate.global.util;

import org.springframework.http.ResponseCookie;

public class CookieUtils {

    public static ResponseCookie httpOnlyCookie(
            String name, String value, long maxAgeSeconds, boolean secure, String sameSite
    ) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .sameSite(sameSite)
                .maxAge(maxAgeSeconds)
                .build();
    }

    public static ResponseCookie expireCookie(String name, boolean secure, String sameSite) {
        return httpOnlyCookie(name, "", 0, secure, sameSite);
    }
}

