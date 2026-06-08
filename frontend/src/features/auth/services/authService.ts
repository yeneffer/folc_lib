import { api } from '@/lib/apiClient';
import { tokenStorage } from '@/lib/token-storage';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserProfile,
} from '@/types';

export const authService = {
  async login(payload: LoginRequest): Promise<UserProfile> {
    const res = await api.post<AuthResponse>('/auth/login', payload, { auth: false });
    tokenStorage.set(res.accessToken, res.refreshToken);
    return res.user;
  },

  async register(payload: RegisterRequest): Promise<UserProfile> {
    const res = await api.post<AuthResponse>('/auth/register', payload, { auth: false });
    tokenStorage.set(res.accessToken, res.refreshToken);
    return res.user;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email }, { auth: false });
  },

  async resetPassword(accessToken: string, novaSenha: string): Promise<void> {
    await api.post('/auth/reset-password', { accessToken, novaSenha }, { auth: false });
  },

  async me(): Promise<UserProfile> {
    return api.get<UserProfile>('/users/me');
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenStorage.clear();
    }
  },

  hasToken(): boolean {
    return !!tokenStorage.getAccess();
  },
};
