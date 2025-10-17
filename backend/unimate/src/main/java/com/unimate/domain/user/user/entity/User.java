package com.unimate.domain.user.user.entity;

import com.unimate.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {
    private String name;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 20)
    private Gender gender; // 기존 String에서 enum Gender로 변경
    private LocalDate birthDate;
    private Boolean studentVerified;
    private String university;

    public User(String name, String email, String password, Gender gender, LocalDate birthDate, String university) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.gender = gender;
        this.birthDate = birthDate;
        this.studentVerified = false;
        this.university = university;
    }
}