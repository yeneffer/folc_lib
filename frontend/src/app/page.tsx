import Link from 'next/link';
import { Card } from '@/components/ui';
import { Recommendations } from '@/features/recommendations';

const DESTAQUES = [
  { href: '/acervo', titulo: 'Explorar o acervo', desc: 'Vídeos, lendas, poemas, receitas e mais.' },
  { href: '/colaborar', titulo: 'Colaborar', desc: 'Envie produções da sua comunidade.' },
  { href: '/faq', titulo: 'Dúvidas', desc: 'Perguntas frequentes sobre a plataforma.' },
];

export default function Home() {
  return (
    <main className="container page">
      <section style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>FolcLib</h1>
        <p className="muted" style={{ maxWidth: 640 }}>
          Plataforma educacional colaborativa sobre cultura e folclore
          brasileiro. Explore o acervo, monte trilhas e contribua com o
          patrimônio cultural.
        </p>
      </section>

      <div className="grid">
        {DESTAQUES.map((d) => (
          <Link key={d.href} href={d.href} style={{ textDecoration: 'none' }}>
            <Card>
              <h3 style={{ marginTop: 0 }}>{d.titulo}</h3>
              <p className="muted" style={{ margin: 0 }}>
                {d.desc}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <Recommendations />
    </main>
  );
}
