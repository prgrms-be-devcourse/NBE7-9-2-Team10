package com.unimate.domain.user.adminUser.controller;

import com.unimate.domain.user.adminUser.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserRepository adminUserRepository;
}
