"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AuthService from "@/lib/services/authService";
import { UserService } from "@/lib/services/UserService";

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
          const userInfo = await UserService.getUserInfo();
          const userId = localStorage.getItem('userId');
          
          setUser({
            userId: userId ? parseInt(userId) : 0,
            email: userInfo.email,
            name: userInfo.name,
            gender: userInfo.gender,
            birthDate: userInfo.birthDate,
            university: userInfo.university
          });
          setIsAuthenticated(true);
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
    
    // 로그인 성공 후 전체 유저 정보 가져오기
    const userInfo = await UserService.getUserInfo();
    
    setUser({
      userId: result.userId,
      email: userInfo.email,
      name: userInfo.name,
      gender: userInfo.gender,
      birthDate: userInfo.birthDate,
      university: userInfo.university
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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
