'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/features/auth';
import type { UserRole } from '@/types';
import { Spinner } from '@/components/ui';

/**
 * Protege rotas no cliente: exige autenticacao e, opcionalmente, um perfil.
 * Redireciona para /login (nao autenticado) ou / (sem permissao).
 */
export function RouteGuard({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: UserRole[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (roles && !roles.includes(user.role)) {
      router.replace('/');
    }
  }, [loading, user, roles, router]);

  if (loading || !user || (roles && !roles.includes(user.role))) {
    return (
      <div className="container page">
        <Spinner />
      </div>
    );
  }
  return <>{children}</>;
}
