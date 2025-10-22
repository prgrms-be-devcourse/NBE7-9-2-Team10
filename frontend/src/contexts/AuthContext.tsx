"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AuthService from "@/lib/services/AuthService";
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
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const login = async (email: string, password: string) => {
    const result = await AuthService.login({ email, password });
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

  const logout = async () => {
    await AuthService.logout();
    AuthService.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};