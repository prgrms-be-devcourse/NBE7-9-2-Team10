import { api } from '@/lib/services/api';
import { API_ENDPOINTS } from '@/types/api';

export interface UserInfo {
  email: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  university: string;
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
}