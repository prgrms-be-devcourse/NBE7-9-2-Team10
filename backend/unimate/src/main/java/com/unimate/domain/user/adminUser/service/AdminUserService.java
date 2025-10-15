package com.unimate.domain.user.adminUser.service;

import com.unimate.domain.user.adminUser.entity.AdminUser;
import com.unimate.domain.user.adminUser.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final AdminUserRepository adminUserRepository;

    public AdminUser join(String name, String email, String password) {
        AdminUser adminUser = new AdminUser(name, email, password);
        adminUserRepository.save(adminUser);
        return adminUser;
    }
}