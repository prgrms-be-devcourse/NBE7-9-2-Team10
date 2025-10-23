"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AdminAuthService from "@/lib/services/AdminAuthService";

interface AdminUser {
  adminId: number;
  email: string;
  name: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAdminAuth = async () => {
      try {
        if (AdminAuthService.isAuthenticated()) {
          // localStorage에서 관리자 정보 직접 가져오기
          const adminId = localStorage.getItem('adminId');
          const email = localStorage.getItem('adminEmail');
          // 'name'은 login 응답에 없으므로 email을 임시로 사용하거나,
          // API 응답에 추가해야 합니다. 여기서는 email을 이름으로 가정합니다.
          const name = localStorage.getItem('adminEmail'); 

          if (adminId && email && name) {
            setAdmin({
              adminId: parseInt(adminId, 10),
              email,
              name,
            });
            setIsAuthenticated(true);
          } else {
            throw new Error("Admin information is missing in localStorage.");
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to initialize admin auth:', error);
        AdminAuthService.clearTokens();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAdminAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const adminInfo = await AdminAuthService.login({ email, password });
    setAdmin(adminInfo);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AdminAuthService.logout();
    setAdmin(null);
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
