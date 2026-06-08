import { Card } from '@/components/ui';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="container page" style={{ maxWidth: 440 }}>
      <Card>
        <LoginForm />
      </Card>
    </main>
  );
}
