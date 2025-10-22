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
    // api.get이 이미 response.data를 반환하므로 직접 사용
    return response;
  }
}