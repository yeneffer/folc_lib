import { AcervoList } from '@/features/acervo';

export default function AcervoPage() {
  return (
    <main className="container page">
      <h1>Acervo</h1>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>
        Explore conteúdos sobre cultura e folclore brasileiro.
      </p>
      <AcervoList />
    </main>
  );
}
