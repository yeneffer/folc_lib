import { Card } from '@/components/ui';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export default function EsqueciSenhaPage() {
  return (
    <main className="container page" style={{ maxWidth: 440 }}>
      <Card>
        <ForgotPasswordForm />
      </Card>
    </main>
  );
}
