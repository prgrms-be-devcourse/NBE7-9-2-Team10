"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AdminAuthService from "@/lib/services/AdminAuthService";

interface AdminUser {
  adminId: number;
  email: string;
  name: string; // email을 name으로 사용
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
        console.log('🔍 AdminAuthContext: Initializing...');
        
        if (AdminAuthService.isAuthenticated()) {
          const adminId = localStorage.getItem('adminId');
          const email = localStorage.getItem('adminEmail');

          console.log('📦 Stored admin info:', { adminId, email });

          if (adminId && email) {
            setAdmin({
              adminId: parseInt(adminId, 10),
              email,
              name: email, // ✅ email을 name으로 사용
            });
            setIsAuthenticated(true);
            console.log('✅ Admin authenticated');
          } else {
            throw new Error("Admin information is missing in localStorage.");
          }
        } else {
          console.log('❌ Not authenticated');
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
    console.log('🔑 AdminAuthContext: Logging in...');
    
    const loginResponse = await AdminAuthService.login({ email, password });
    
    console.log('✅ Login response:', loginResponse);
    
    // ✅ email을 name으로 사용
    const adminUser: AdminUser = {
      adminId: loginResponse.adminId,
      email: loginResponse.email,
      name: loginResponse.email, // ✅ email을 name으로 사용
    };
    
    setAdmin(adminUser);
    setIsAuthenticated(true);
    
    console.log('✅ Admin state updated:', adminUser);
  };

  const logout = async () => {
    console.log('🚪 AdminAuthContext: Logging out...');
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