'use client';

import { RouteGuard } from '@/components/layout/RouteGuard';
import { useAuth } from '@/features/auth';
import { Badge } from '@/components/ui';
import { ProfileForms } from '@/features/profile';

function ProfileHeader() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <p className="muted">
      {user.email} · <Badge>{user.role}</Badge>
    </p>
  );
}

export default function PerfilPage() {
  return (
    <main className="container page" style={{ maxWidth: 620 }}>
      <h1>Meu perfil</h1>
      <RouteGuard>
        <ProfileHeader />
        <ProfileForms />
      </RouteGuard>
    </main>
  );
}
