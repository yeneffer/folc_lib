import Link from 'next/link';
import { Badge, Card } from '@/components/ui';
import type { ContentSummary } from '@/types';

export function ContentCard({ content }: { content: ContentSummary }) {
  return (
    <Link href={`/conteudo/${content.id}`} style={{ textDecoration: 'none' }}>
      <Card>
        <div
          style={{
            height: 120,
            borderRadius: 8,
            marginBottom: '0.75rem',
            background: content.thumbUrl
              ? `center/cover no-repeat url(${content.thumbUrl})`
              : '#f3ede2',
          }}
          aria-hidden
        />
        <div className="row" style={{ marginBottom: '0.4rem' }}>
          <Badge>{content.tipo}</Badge>
          {content.pedagogico && <Badge tone="muted">pedagógico</Badge>}
        </div>
        <strong>{content.titulo}</strong>
        {content.estado && (
          <p className="muted" style={{ margin: '0.25rem 0 0' }}>
            {content.origemCultural ?? ''} {content.estado}
          </p>
        )}
      </Card>
    </Link>
  );
}
