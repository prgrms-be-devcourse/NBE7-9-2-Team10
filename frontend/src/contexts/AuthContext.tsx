'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '@/lib/services/authService';
import { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && AuthService.isTokenValid();

  useEffect(() => {
    // 로그인 시 저장된 정보만 사용 (API 호출 없음)
    try {
      if (AuthService.isTokenValid()) {
        const userId = localStorage.getItem('userId');
        const email = localStorage.getItem('email');
        if (userId && email) {
          setUser({ userId: Number(userId), email } as User);
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      AuthService.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await AuthService.login({ email, password });
      // localStorage에서 바로 사용자 정보 가져오기
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('email');
      if (userId && userEmail) {
        setUser({ userId: Number(userId), email: userEmail } as User);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // 토큰과 사용자 정보 제거
      AuthService.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (AuthService.isTokenValid()) {
        // localStorage에서 바로 사용자 정보 가져오기
        const userId = localStorage.getItem('userId');
        const email = localStorage.getItem('email');
        if (userId && email) {
          setUser({ userId: Number(userId), email } as User);
        }
      }
    } catch (error) {
      console.error('User refresh failed:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
