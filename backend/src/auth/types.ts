import { UserRole } from '../common/enums';
import { UserProfile } from '../users/entities/user-profile.entity';

/** Usuario autenticado anexado a `request.user` pelos guards. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

/** Resposta de autenticacao — ver CONTRATOS-API.md (AuthResponse). */
export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
