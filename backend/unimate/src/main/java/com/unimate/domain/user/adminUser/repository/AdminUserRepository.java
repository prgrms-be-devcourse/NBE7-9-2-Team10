package com.unimate.domain.user.adminUser.repository;

import com.unimate.domain.user.adminUser.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminUserRepository  extends JpaRepository<AdminUser,Long> {
}
