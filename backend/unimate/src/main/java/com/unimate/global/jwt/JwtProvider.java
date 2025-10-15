package com.unimate.global.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
public class JwtProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpirationTime;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpirationTime;

    private SecretKey key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public JwtToken generateToken(String email, Long userId) {
        Date now = new Date();

        String accessToken = Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessTokenExpirationTime))
                .signWith(key)
                .compact();

        String refreshToken = Jwts.builder()
                .issuedAt(now)
                .expiration(new Date(now.getTime() + refreshTokenExpirationTime))
                .signWith(key)
                .compact();

        return new JwtToken("Bearer", accessToken, refreshToken, accessTokenExpirationTime);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("토큰 만료: {}", e.getMessage());
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("잘못된 토큰: {}", e.getMessage());
        }
        return false;
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        return claims.getSubject();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        return claims.get("userId", Long.class);
    }
}
