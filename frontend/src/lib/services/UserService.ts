import { api } from '@/lib/services/api';
import { API_ENDPOINTS } from '@/types/api';

export interface UserInfo {
  email: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  university: string;
}

export interface UserUpdateEmailResponse extends UserInfo {
  accessToken: string;
}

export class UserService {
  static async getUserInfo(): Promise<UserInfo> {
    const response = await api.get<UserInfo>(API_ENDPOINTS.USER);
    return response;
  }

  static async updateName(name: string): Promise<UserInfo> {
    const response = await api.patch<UserInfo>(
      `${API_ENDPOINTS.USER}/name`,
      { name }
    );
    return response;
  }

  static async updateEmail(newEmail: string, code: string): Promise<UserUpdateEmailResponse> {
    const response = await api.patch<UserUpdateEmailResponse>(
      `${API_ENDPOINTS.USER}/email`,
      { newEmail, code }
    );
    return response;
  }
}