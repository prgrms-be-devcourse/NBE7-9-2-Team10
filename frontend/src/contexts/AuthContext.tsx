'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AuthService from "@/lib/services/authService";

// ✅ User 타입 정의 (ProfileCard에서 필요한 모든 필드 포함)
interface User {
  userId: number;
  email: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  university: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  signup?: (userData: any) => Promise<void>;
  refreshUser?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ 앱 시작 시 로그인 상태 확인 및 전체 유저 정보 가져오기
  useEffect(() => {
    const initAuth = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          // localStorage에서 기본 정보 가져오기 (API 호출 대신)
          const userId = localStorage.getItem('userId');
          const email = localStorage.getItem('email');
          
          if (userId && email) {
            setUser({
              userId: userId ? parseInt(userId) : 0,
              email: email,
              name: '',
              gender: 'MALE',
              birthDate: '',
              university: ''
            });
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Failed to fetch user info:', error);
          AuthService.clearTokens();
          setIsAuthenticated(false);
        }
      }
    };

    initAuth();
  }, []);

  // ✅ 로그인 후 전체 유저 정보 가져오기
  const login = async (email: string, password: string) => {
    const result = await AuthService.login({ email, password });
    
    setUser({
      userId: result.userId,
      email: result.email,
      name: '',
      gender: 'MALE',
      birthDate: '',
      university: ''
    });
    setIsAuthenticated(true);
  };

  // ✅ 로그아웃
  const logout = async () => {
    await AuthService.logout();
    AuthService.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  // 회원가입 (선택적 - 기존 코드와의 호환성)
  const signup = async (userData: any) => {
    await AuthService.signup(userData);
  };

  // refreshUser (선택적 - 기존 코드와의 호환성)
  const refreshUser = async () => {
    if (AuthService.isAuthenticated()) {
      const userId = localStorage.getItem('userId');
      const email = localStorage.getItem('email');
      
      if (userId && email) {
        setUser({
          userId: parseInt(userId),
          email: email,
          name: '',
          gender: 'MALE',
          birthDate: '',
          university: ''
        });
        setIsAuthenticated(true);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, signup, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ 훅 export
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
