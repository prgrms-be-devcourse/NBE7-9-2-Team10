package com.unimate.domain.user.user.entity;

import com.unimate.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class user extends BaseEntity {
    private String name;
    private String email;
    private String password;
    private String gender;
    private Boolean student_verified;
    private String university;

    public user(String name, String email, String password, String gender, String university) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.gender = gender;
        this.university = university;
    }
}