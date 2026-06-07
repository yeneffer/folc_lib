import { UserRole } from '../../common/enums';

/** Contrato de saida do perfil — ver CONTRATOS-API.md (UserProfile). */
export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
}

/** Linha bruta da tabela public.profiles. */
export interface ProfileRow {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

/** Converte a linha do banco no contrato de saida (camelCase). */
export function toUserProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}
