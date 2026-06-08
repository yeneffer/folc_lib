import type { ContentType } from '@/types';

/** Renderiza a midia conforme o tipo do conteudo. */
export function MediaView({
  tipo,
  url,
}: {
  tipo: ContentType;
  url: string | null;
}) {
  if (!url) return null;

  if (tipo === 'video') {
    return <video src={url} controls style={{ width: '100%', borderRadius: 8 }} />;
  }
  if (tipo === 'imagem') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" style={{ width: '100%', borderRadius: 8 }} />;
  }
  if (tipo === 'musica') {
    return <audio src={url} controls style={{ width: '100%' }} />;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="btn btn-secondary">
      Abrir material
    </a>
  );
}
