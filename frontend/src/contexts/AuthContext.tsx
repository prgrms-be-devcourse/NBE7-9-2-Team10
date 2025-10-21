'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services/authService';
import { User } from '@/types/user';

// 인증 상태 타입 정의
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// 인증 컨텍스트 타입 정의
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 인증 상태 확인
  const isAuthenticated = !!user && AuthService.isTokenValid();

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    try {
      if (AuthService.isTokenValid()) {
        // localStorage에서 기본 정보만 가져오기
        const userId = localStorage.getItem('userId');
        const email = localStorage.getItem('email');
        
        if (userId && email) {
          setUser({
            id: Number(userId),
            email: email,
            name: '',
            password: '',
            gender: 'MALE' as any,
            birthDate: '',
            studentVerified: false,
            university: '',
            createdAt: '',
            updatedAt: ''
          });
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      setUser(null);
    }
  };

  // 로그인
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await AuthService.login({ email, password });
      await refreshUser();
      router.push('/');
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 회원가입
  const signup = async (userData: any) => {
    try {
      setIsLoading(true);
      await AuthService.signup(userData);
      router.push('/login');
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 인증 상태 확인
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        if (AuthService.isTokenValid()) {
          await refreshUser();
        }
      } catch (error) {
        console.error('인증 초기화 실패:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    signup,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth 훅
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 기본 export
export default AuthContext;
