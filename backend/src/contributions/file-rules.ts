/** Formatos aceitos para contribuicoes (RF05, fluxo alternativo B4.4). */
export const ALLOWED_EXTENSIONS = [
  // imagens
  'jpg', 'jpeg', 'png', 'gif', 'webp',
  // video
  'mp4', 'webm', 'mov',
  // audio
  'mp3', 'wav', 'ogg',
  // documentos/texto
  'pdf', 'txt',
];

export function extensionOf(nome: string): string {
  const idx = nome.lastIndexOf('.');
  return idx >= 0 ? nome.slice(idx + 1).toLowerCase() : '';
}

/** Retorna os nomes de arquivo cujo formato nao e aceito. */
export function invalidFiles(arquivos: Array<{ nome: string }>): string[] {
  return arquivos
    .filter((a) => !ALLOWED_EXTENSIONS.includes(extensionOf(a.nome)))
    .map((a) => a.nome);
}
