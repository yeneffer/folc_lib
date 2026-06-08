import { Card } from '@/components/ui';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function CadastroPage() {
  return (
    <main className="container page" style={{ maxWidth: 460 }}>
      <Card>
        <RegisterForm />
      </Card>
    </main>
  );
}
