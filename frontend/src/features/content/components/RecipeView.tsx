import { Card } from '@/components/ui';

/** Render de receita a partir do metadata (B2.5). */
export function RecipeView({ metadata }: { metadata: Record<string, unknown> }) {
  const ingredientes = Array.isArray(metadata.ingredientes)
    ? (metadata.ingredientes as unknown[]).map(String)
    : [];
  const modoPreparo =
    typeof metadata.modoPreparo === 'string' ? metadata.modoPreparo : '';

  if (ingredientes.length === 0 && !modoPreparo) return null;

  return (
    <Card>
      <h3 style={{ marginTop: 0 }}>Receita</h3>
      {ingredientes.length > 0 && (
        <>
          <strong>Ingredientes</strong>
          <ul>
            {ingredientes.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
        </>
      )}
      {modoPreparo && (
        <>
          <strong>Modo de preparo</strong>
          <p style={{ whiteSpace: 'pre-wrap' }}>{modoPreparo}</p>
        </>
      )}
    </Card>
  );
}
