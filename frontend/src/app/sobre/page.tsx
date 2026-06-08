import { Card } from '@/components/ui';

export default function SobrePage() {
  return (
    <main className="container page" style={{ maxWidth: 760 }}>
      <h1>Sobre nós</h1>
      <div className="stack">
        <Card>
          <p style={{ marginTop: 0 }}>
            O <strong>FolcLib</strong> é uma plataforma educacional colaborativa
            voltada ao ensino e à valorização da cultura e do folclore
            brasileiro na Educação Básica. Reúne conteúdos multimídia — vídeos,
            poemas, lendas, receitas, relatos e imagens — com curadoria
            especializada e participação das comunidades culturais.
          </p>
        </Card>

        <Card>
          <h3 style={{ marginTop: 0 }}>Compromissos éticos</h3>
          <ul style={{ marginBottom: 0 }}>
            <li>Respeito à LGPD e ao tratamento ético dos dados pessoais.</li>
            <li>Curadoria contra plágio, estereótipos e conteúdos ofensivos.</li>
            <li>
              Crédito ao verdadeiro autor e respeito às comunidades de origem.
            </li>
            <li>Equidade de acesso a todos os perfis de usuário.</li>
          </ul>
        </Card>
      </div>
    </main>
  );
}
