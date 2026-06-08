import { Suspense } from 'react';
import { Card, Spinner } from '@/components/ui';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export default function RedefinirSenhaPage() {
  return (
    <main className="container page" style={{ maxWidth: 440 }}>
      <Card>
        <Suspense fallback={<Spinner />}>
          <ResetPasswordForm />
        </Suspense>
      </Card>
    </main>
  );
}
