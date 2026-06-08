import { Card } from '@/components/ui';
import { ErrorReportForm } from '@/features/support';

export default function ReportarErroPage() {
  return (
    <main className="container page" style={{ maxWidth: 560 }}>
      <h1>Relatar erro</h1>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>
        Encontrou um problema? Conte para a gente.
      </p>
      <Card>
        <ErrorReportForm />
      </Card>
    </main>
  );
}
