package com.unimate.domain.user.adminUser.entity;

import com.unimate.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AdminUser extends BaseEntity {
    private String name;
    private String email;
    private String password;


    public AdminUser(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }
}
