package com.unimate.global.config;

import com.unimate.global.jwt.JwtAuthEntryPoint;
import com.unimate.global.jwt.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtFilter;
    private final JwtAuthEntryPoint entryPoint;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF 비활성화
                .csrf(csrf -> csrf.disable())

                // H2 Console을 위한 헤더 프레임 옵션 비활성화
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))

                // 예외 처리 시 JwtAuthEntryPoint 사용
                .exceptionHandling(ex -> ex.authenticationEntryPoint(entryPoint))

                // 세션 관리 정책을 STATELESS로 설정 (JWT 사용)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // HTTP 요청 인가 규칙 설정
                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers(
//                                "/auth/**",
//                                "/error",
//                                "/favicon.ico",
//                                "/h2-console/**"
//                        ).permitAll() // 특정 경로들은 모두 허용
//                        .anyRequest().authenticated() // 그 외의 모든 요청은 인증 필요
                        .anyRequest().permitAll() // 모든 요청을 임시로 허용
                )

                // JwtAuthFilter를 UsernamePasswordAuthenticationFilter 앞에 추가
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}