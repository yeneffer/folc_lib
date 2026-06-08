'use client';

import { Card, Field, SelectField } from '@/components/ui';
import type { AcervoQuery, Category, ContentType } from '@/types';

const TIPOS: ContentType[] = [
  'video',
  'poema',
  'lenda',
  'texto',
  'imagem',
  'receita',
  'musica',
];

export function AcervoFilters({
  filters,
  categories,
  onChange,
}: {
  filters: AcervoQuery;
  categories: Category[];
  onChange: (patch: Partial<AcervoQuery>) => void;
}) {
  return (
    <Card>
      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}
      >
        <Field
          label="Buscar"
          placeholder="Título…"
          defaultValue={filters.q ?? ''}
          onChange={(e) => onChange({ q: e.target.value || undefined })}
        />
        <SelectField
          label="Tipo"
          value={(filters.tipo as string) ?? ''}
          onChange={(e) =>
            onChange({ tipo: e.target.value ? ([e.target.value] as ContentType[]) : undefined })
          }
        >
          <option value="">Todos</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Categoria"
          value={(filters.categoria as string) ?? ''}
          onChange={(e) =>
            onChange({ categoria: e.target.value ? [e.target.value] : undefined })
          }
        >
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.nome}
            </option>
          ))}
        </SelectField>
        <Field
          label="Estado (UF)"
          placeholder="Ex.: BA"
          defaultValue={filters.estado ?? ''}
          onChange={(e) => onChange({ estado: e.target.value || undefined })}
        />
        <SelectField
          label="Versão"
          value={filters.pedagogico === undefined ? '' : String(filters.pedagogico)}
          onChange={(e) =>
            onChange({
              pedagogico: e.target.value === '' ? undefined : e.target.value === 'true',
            })
          }
        >
          <option value="">Todas</option>
          <option value="true">Pedagógica</option>
          <option value="false">Padrão</option>
        </SelectField>
      </div>
    </Card>
  );
}
