"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AdminAuthService from "@/lib/services/AdminAuthService";

interface AdminUser {
  adminId: number;
  email: string;
  // name 제거
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
          const adminId = localStorage.getItem('adminId');
          const email = localStorage.getItem('adminEmail');

          if (adminId && email) {
            setAdmin({
              adminId: parseInt(adminId, 10),
              email,
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
    const loginResponse = await AdminAuthService.login({ email, password });
    
    // ✅ name 필드 제거
    const adminUser: AdminUser = {
      adminId: loginResponse.adminId,
      email: loginResponse.email,
    };
    
    setAdmin(adminUser);
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