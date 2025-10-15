package com.unimate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class UnimateApplication {

    public static void main(String[] args) {
        SpringApplication.run(UnimateApplication.class, args);
    }
}