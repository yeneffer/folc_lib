import Link from 'next/link';
import { FaqList } from '@/features/support';

export default function FaqPage() {
  return (
    <main className="container page" style={{ maxWidth: 720 }}>
      <h1>Perguntas frequentes</h1>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>
        Não encontrou o que procurava?{' '}
        <Link href="/reportar-erro">Relate um erro</Link>.
      </p>
      <FaqList />
    </main>
  );
}
