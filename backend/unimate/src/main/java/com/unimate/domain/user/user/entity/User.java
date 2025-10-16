package com.unimate.domain.user.user.entity;

import com.unimate.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
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
    private String gender;
    private LocalDate birthDate;
    private Boolean student_verified;
    private String university;

    public User(String name, String email, String password, String gender, LocalDate birthDate, String university) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.gender = gender;
        this.birthDate = birthDate;
        this.student_verified = false;
        this.university = university;
    }
}