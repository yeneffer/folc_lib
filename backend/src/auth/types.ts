import { UserRole } from '../common/enums';

/** Usuario autenticado anexado a `request.user` pelos guards. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}
