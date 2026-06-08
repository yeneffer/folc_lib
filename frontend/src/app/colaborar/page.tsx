import { Card } from '@/components/ui';
import { ContributionForm } from '@/features/contributions';

export default function ColaborarPage() {
  return (
    <main className="container page" style={{ maxWidth: 620 }}>
      <h1>Colaborar com o acervo</h1>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>
        Envie relatos, imagens, vídeos e produções culturais. Visitantes também
        podem contribuir.
      </p>
      <Card>
        <ContributionForm />
      </Card>
    </main>
  );
}
