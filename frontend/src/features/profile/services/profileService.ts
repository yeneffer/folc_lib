import { api } from '@/lib/apiClient';
import type { UserProfile } from '@/types';

export const profileService = {
  updateProfile(payload: { nome?: string; avatarUrl?: string }): Promise<UserProfile> {
    return api.patch<UserProfile>('/users/me', payload);
  },
  updateSecurity(payload: { email?: string; novaSenha?: string }): Promise<UserProfile> {
    return api.patch<UserProfile>('/users/me/security', payload);
  },
};
