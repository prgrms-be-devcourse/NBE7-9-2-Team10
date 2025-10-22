"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AuthService from "@/lib/services/AuthService";

interface UserInfo {
  userId: number;
  email: string;
}

interface AuthContextType {
  user: UserInfo | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ 앱 시작 시 로그인 상태 확인
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      AuthService.getCurrentUser()
        .then((data) => {
          setUser(data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          AuthService.clearTokens();
          setIsAuthenticated(false);
        });
    }
  }, []);

  // ✅ 로그인
  const login = async (email: string, password: string) => {
    const result = await AuthService.login({ email, password });
    setUser({ userId: result.userId, email: result.email });
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

// ✅ 훅 export (named export)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
