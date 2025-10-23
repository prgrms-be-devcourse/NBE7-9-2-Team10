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
  isLoading: boolean;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (AuthService.isAuthenticated()) {
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
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        AuthService.clearTokens();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await AuthService.login({ email, password });
    const userInfo = await UserService.getUserInfo();
    
    // 사용자 ID를 localStorage에 저장 (알림 필터링용)
    localStorage.setItem('userId', result.userId.toString());
    
    setUser({
      userId: result.userId,
      email: userInfo.email,
      name: userInfo.name,
      gender: userInfo.gender,
      birthDate: userInfo.birthDate,
      university: userInfo.university
    });
    setIsAuthenticated(true);
    
    // WebSocket 연결 시작 (알림용)
    try {
      const { startWs } = await import('@/lib/services/wsManager');
      await startWs();
    } catch (error) {
      // WebSocket 연결 실패는 무시
    }
  };

  const logout = async () => {
    // WebSocket 연결 종료
    try {
      const { stopWs } = await import('@/lib/services/wsManager');
      await stopWs();
    } catch (error) {
      // WebSocket 연결 종료 실패는 무시
    }
    
    await AuthService.logout();
    AuthService.clearTokens();
    localStorage.removeItem('userId'); // 사용자 ID 제거
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
