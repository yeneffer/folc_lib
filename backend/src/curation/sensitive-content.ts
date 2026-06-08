/**
 * Deteccao heuristica de conteudo sensivel/estereotipado (RF04, fluxo
 * alternativo). Base minima a ser expandida com a curadoria; a ideia e
 * bloquear a publicacao automatica quando ha sinalizacao.
 */
const SENSITIVE_TERMS = [
  'estereotipo',
  'estereótipo',
  'racismo',
  'racista',
  'preconceito',
  'discriminacao',
  'discriminação',
  'ofensivo',
  'ofensa',
  'apropriacao indevida',
  'apropriação indevida',
];

export interface SensitivityResult {
  flagged: boolean;
  terms: string[];
}

/** Verifica os campos textuais de um conteudo contra a lista sensivel. */
export function checkSensitiveContent(parts: Array<string | null | undefined>): SensitivityResult {
  const haystack = parts.filter(Boolean).join(' ').toLowerCase();
  const terms = SENSITIVE_TERMS.filter((t) => haystack.includes(t));
  return { flagged: terms.length > 0, terms };
}
