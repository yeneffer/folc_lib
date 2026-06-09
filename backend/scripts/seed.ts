/**
 * Seed de dados de demonstracao do FolcLib.
 *
 * Cria usuarios reais no Supabase Auth (com senha), perfis, acervo aprovado,
 * turmas com alunos/prazos/progresso e uma contribuicao pendente.
 * Idempotente: usuarios existentes sao reaproveitados; demais registros usam
 * upsert por id.
 *
 * Uso: a partir de backend/  ->  npm run seed
 * Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.
 */
import 'dotenv/config';
// realtime-js exige WebSocket nativo (ausente no Node 20)
import { WebSocket } from 'ws';
if (!(globalThis as { WebSocket?: unknown }).WebSocket) {
  (globalThis as { WebSocket?: unknown }).WebSocket = WebSocket;
}
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
}
const sb: SupabaseClient = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PASSWORD = '12345678';
const now = () => new Date().toISOString();
const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

type Role = 'aluno' | 'professor' | 'avaliador' | 'colaborador';

// ---------------------------------------------------------------------------
// Usuarios
// ---------------------------------------------------------------------------
const USERS: { email: string; nome: string; role: Role }[] = [
  { email: 'avaliador@folclib.test', nome: 'Marta Avaliadora', role: 'avaliador' },
  { email: 'prof.ana@folclib.test', nome: 'Ana Pereira', role: 'professor' },
  { email: 'prof.carlos@folclib.test', nome: 'Carlos Souza', role: 'professor' },
  { email: 'colab.joao@folclib.test', nome: 'Joao das Comunidades', role: 'colaborador' },
  { email: 'colab.lia@folclib.test', nome: 'Lia do Quilombo', role: 'colaborador' },
  { email: 'bia@folclib.test', nome: 'Bia Almeida', role: 'aluno' },
  { email: 'davi@folclib.test', nome: 'Davi Nunes', role: 'aluno' },
  { email: 'enzo@folclib.test', nome: 'Enzo Ribeiro', role: 'aluno' },
  { email: 'fernanda@folclib.test', nome: 'Fernanda Lima', role: 'aluno' },
  { email: 'gabriel@folclib.test', nome: 'Gabriel Costa', role: 'aluno' },
];

async function findUserId(email: string): Promise<string | null> {
  for (let page = 1; page <= 10; page++) {
    const { data } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
    const found = data.users.find((u) => u.email === email);
    if (found) return found.id;
    if (data.users.length < 1000) return null;
  }
  return null;
}

async function ensureUser(email: string, nome: string, role: Role): Promise<string> {
  const created = await sb.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { nome, role },
  });
  let id: string;
  if (created.error) {
    const existing = await findUserId(email);
    if (!existing) throw created.error;
    id = existing;
    await sb.auth.admin.updateUserById(id, { password: PASSWORD });
  } else {
    id = created.data.user!.id;
  }
  await sb.from('profiles').upsert({ id, nome, email, role }, { onConflict: 'id' });
  return id;
}

// ---------------------------------------------------------------------------
// Acervo (textos ficticios)
// ---------------------------------------------------------------------------
const CONTENT = [
  {
    id: 'c1000000-0000-4000-8000-000000000001',
    titulo: 'A Lenda do Saci-Perere',
    tipo: 'lenda', estado: 'SP', origem: 'Sudeste', evento: null, comunidade: null,
    pedagogico: true, cats: ['folclore'],
    descricao:
      'Conta-se que o Saci-Perere e um menino travesso de uma perna so, que usa um gorro vermelho magico e se diverte assustando viajantes. Quem captura seu gorro pode pedir um desejo. Figura central do folclore brasileiro, ele representa a esperteza e a conexao com a mata.',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000002',
    titulo: 'A Lenda da Iara',
    tipo: 'lenda', estado: 'AM', origem: 'Norte', evento: null, comunidade: null,
    pedagogico: false, cats: ['folclore'],
    descricao:
      'A Iara e a mae-d-agua dos rios amazonicos. Com canto encantador, atrai pescadores para as profundezas. A lenda fala do respeito as aguas e aos misterios que elas guardam.',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000003',
    titulo: 'O Curupira, Protetor da Mata',
    tipo: 'lenda', estado: 'PA', origem: 'Norte', evento: null, comunidade: null,
    pedagogico: true, cats: ['folclore'],
    descricao:
      'De pes virados para tras, o Curupira confunde cacadores e protege os animais da floresta. E um simbolo da preservacao ambiental presente em muitas culturas indigenas.',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000004',
    titulo: 'Cordel: Historias do Sertao',
    tipo: 'poema', estado: 'CE', origem: 'Nordeste', evento: null, comunidade: null,
    pedagogico: false, cats: ['costumes'],
    descricao:
      'Em versos rimados, o cordel narra as agruras e alegrias do povo sertanejo: a seca, a fe, o cangaco e a festa. Tradicao literaria popular vendida em folhetos nas feiras nordestinas.',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000005',
    titulo: 'Festa de Sao Joao no Nordeste',
    tipo: 'texto', estado: 'PE', origem: 'Nordeste', evento: 'Sao Joao', comunidade: null,
    pedagogico: true, cats: ['costumes'],
    descricao:
      'As festas juninas celebram Santo Antonio, Sao Joao e Sao Pedro com quadrilhas, fogueiras, comidas de milho e forro. Sao um dos maiores patrimonios culturais do Nordeste brasileiro.',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000006',
    titulo: 'Bumba Meu Boi do Maranhao',
    tipo: 'texto', estado: 'MA', origem: 'Nordeste', evento: null, comunidade: null,
    pedagogico: false, cats: ['costumes'],
    descricao:
      'Auto popular que encena a morte e a ressurreicao de um boi, misturando teatro, danca e musica. Reconhecido como Patrimonio Cultural Imaterial da Humanidade.',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000007',
    titulo: 'Receita de Acaraje',
    tipo: 'receita', estado: 'BA', origem: 'Nordeste', evento: null, comunidade: 'Comunidades afro-brasileiras',
    pedagogico: false, cats: ['gastronomica', 'receitas'],
    descricao: 'Quitute baiano de origem afro-brasileira, frito no azeite de dende.',
    metadata: {
      ingredientes: ['Feijao fradinho', 'Cebola', 'Sal', 'Azeite de dende', 'Camarao seco'],
      modoPreparo:
        'Deixe o feijao de molho, retire a casca e bata com cebola e sal. Modele os bolinhos e frite no azeite de dende bem quente. Sirva com vatapa, caruru e camarao.',
    },
  },
  {
    id: 'c1000000-0000-4000-8000-000000000008',
    titulo: 'Receita de Tacaca Paraense',
    tipo: 'receita', estado: 'PA', origem: 'Norte', evento: null, comunidade: 'Povos da Amazonia',
    pedagogico: true, cats: ['gastronomica', 'receitas'],
    descricao: 'Caldo indigena amazonico servido bem quente na cuia.',
    metadata: {
      ingredientes: ['Tucupi', 'Jambu', 'Goma de tapioca', 'Camarao seco', 'Pimenta'],
      modoPreparo:
        'Ferva o tucupi com temperos. Cozinhe a goma ate engrossar. Escalde o jambu. Monte na cuia a goma, o tucupi, o jambu e o camarao. Sirva quente.',
    },
  },

  // ----- Musica -----
  {
    id: 'c1000000-0000-4000-8000-000000000009',
    titulo: 'Maracatu de Baque Virado',
    tipo: 'musica', estado: 'PE', origem: 'Nordeste', evento: 'Carnaval', comunidade: 'Nacoes de Maracatu',
    pedagogico: true, cats: ['musica', 'costumes'],
    descricao:
      'Ritmo pernambucano de forte percussao, com alfaias, caixas e gonguês. O cortejo real do maracatu de baque virado celebra a ancestralidade afro-brasileira nas ruas do Recife e Olinda.',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000010',
    titulo: 'Carimbo do Para',
    tipo: 'musica', estado: 'PA', origem: 'Norte', evento: null, comunidade: 'Povos da Amazonia',
    pedagogico: false, cats: ['musica', 'costumes'],
    descricao:
      'Danca e ritmo paraense de raiz indigena e africana, marcado pelo som do tambor de carimbo. Os pares giram em roda com lencos coloridos ao som de bandolins e maracas.',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000011',
    titulo: 'Ciranda Cirandinha',
    tipo: 'musica', estado: 'PB', origem: 'Nordeste', evento: null, comunidade: null,
    pedagogico: true, cats: ['musica', 'costumes'],
    descricao:
      'Cantiga de roda tradicional cantada por criancas de maos dadas. Simples e repetitiva, ensina ritmo, cooperacao e faz parte da memoria afetiva de geracoes.',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000012',
    titulo: 'Toada de Boi-Bumba',
    tipo: 'musica', estado: 'AM', origem: 'Norte', evento: 'Festival de Parintins', comunidade: null,
    pedagogico: false, cats: ['musica', 'folclore'],
    descricao:
      'Canto vibrante do Festival de Parintins, em que os bois Garantido e Caprichoso disputam a arena. A toada mistura lendas amazonicas, ritmo indigena e poesia.',
  },

  // ----- Lendas (adicionais) -----
  {
    id: 'c1000000-0000-4000-8000-000000000013',
    titulo: 'O Boto Cor-de-Rosa',
    tipo: 'lenda', estado: 'AM', origem: 'Norte', evento: null, comunidade: 'Povos da Amazonia',
    pedagogico: false, cats: ['folclore'],
    descricao:
      'Nas noites de festa as margens do rio, o boto se transforma em um rapaz elegante de chapeu branco para encantar as mocas. Ao amanhecer, volta a ser boto e mergulha nas aguas.',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000014',
    titulo: 'A Lenda do Boitata',
    tipo: 'lenda', estado: 'RS', origem: 'Sul', evento: null, comunidade: null,
    pedagogico: true, cats: ['folclore'],
    descricao:
      'Uma serpente de fogo que protege os campos contra quem ateia queimadas. Seus olhos brilham na escuridao e cegam aqueles que desrespeitam a natureza.',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000015',
    titulo: 'A Mula Sem Cabeca',
    tipo: 'lenda', estado: 'MG', origem: 'Sudeste', evento: null, comunidade: null,
    pedagogico: false, cats: ['folclore'],
    descricao:
      'Conta a tradicao que a mula sem cabeca galopa pelas estradas soltando fogo pelo pescoco nas noites de quinta para sexta. E uma das assombracoes mais conhecidas do interior do Brasil.',
  },
];

// ---------------------------------------------------------------------------
async function main() {
  console.log('Criando usuarios (senha padrao: ' + PASSWORD + ')...');
  const id: Record<string, string> = {};
  for (const u of USERS) {
    id[u.email] = await ensureUser(u.email, u.nome, u.role);
    console.log(`  ${u.role.padEnd(11)} ${u.email}`);
  }

  // categorias (ja semeadas pela migration 0003)
  const { data: cats } = await sb.from('categories').select('id, slug');
  const catId: Record<string, string> = {};
  for (const c of (cats ?? []) as { id: string; slug: string }[]) catId[c.slug] = c.id;

  console.log('Criando acervo...');
  const colabs = [id['colab.joao@folclib.test'], id['colab.lia@folclib.test']];
  for (let i = 0; i < CONTENT.length; i++) {
    const c = CONTENT[i];
    await sb.from('contents').upsert(
      {
        id: c.id,
        titulo: c.titulo,
        descricao: c.descricao,
        tipo: c.tipo,
        status: 'aprovado',
        autor_id: colabs[i % colabs.length],
        origem_cultural: c.origem,
        estado: c.estado,
        evento: c.evento,
        comunidade: c.comunidade,
        pedagogico: c.pedagogico,
        metadata: (c as { metadata?: unknown }).metadata ?? {},
        published_at: now(),
      },
      { onConflict: 'id' },
    );
    await sb.from('content_categories').delete().eq('content_id', c.id);
    await sb.from('content_categories').insert(
      c.cats.filter((s) => catId[s]).map((s) => ({ content_id: c.id, category_id: catId[s] })),
    );
  }
  console.log(`  ${CONTENT.length} conteudos aprovados`);

  console.log('Criando turmas, prazos e progresso...');
  // Turma 1 — Ana
  const turma1 = 'd1000000-0000-4000-8000-000000000001';
  const asg1 = 'a1000000-0000-4000-8000-000000000001';
  const asg2 = 'a1000000-0000-4000-8000-000000000002';
  await sb.from('classes').upsert(
    { id: turma1, professor_id: id['prof.ana@folclib.test'], nome: 'Folclore Brasileiro - 6o ano', codigo: 'FOLC6A', descricao: 'Trilha introdutoria sobre lendas e costumes.' },
    { onConflict: 'id' },
  );
  await sb.from('class_students').upsert(
    [id['bia@folclib.test'], id['davi@folclib.test'], id['enzo@folclib.test']].map((s) => ({ class_id: turma1, student_id: s })),
    { onConflict: 'class_id,student_id' },
  );
  await sb.from('assignments').upsert(
    [
      { id: asg1, class_id: turma1, titulo: 'Leitura: A Lenda do Saci', descricao: 'Leia e resuma a lenda.', content_id: CONTENT[0].id, due_date: inDays(7) },
      { id: asg2, class_id: turma1, titulo: 'Pesquisa de receita regional', descricao: 'Traga uma receita tipica.', content_id: CONTENT[6].id, due_date: inDays(14) },
    ],
    { onConflict: 'id' },
  );
  await sb.from('assignment_progress').upsert(
    [
      { assignment_id: asg1, student_id: id['bia@folclib.test'], status: 'concluido', completed_at: now() },
      { assignment_id: asg1, student_id: id['davi@folclib.test'], status: 'pendente', completed_at: null },
    ],
    { onConflict: 'assignment_id,student_id' },
  );

  // Turma 2 — Carlos
  const turma2 = 'd1000000-0000-4000-8000-000000000002';
  const asg3 = 'a1000000-0000-4000-8000-000000000003';
  await sb.from('classes').upsert(
    { id: turma2, professor_id: id['prof.carlos@folclib.test'], nome: 'Cultura Popular - 7o ano', codigo: 'CULT7B', descricao: 'Festas e manifestacoes culturais.' },
    { onConflict: 'id' },
  );
  await sb.from('class_students').upsert(
    [id['enzo@folclib.test'], id['fernanda@folclib.test'], id['gabriel@folclib.test']].map((s) => ({ class_id: turma2, student_id: s })),
    { onConflict: 'class_id,student_id' },
  );
  await sb.from('assignments').upsert(
    [{ id: asg3, class_id: turma2, titulo: 'Resumo: Festa de Sao Joao', descricao: 'Descreva uma festa junina da sua regiao.', content_id: CONTENT[4].id, due_date: inDays(10) }],
    { onConflict: 'id' },
  );
  await sb.from('assignment_progress').upsert(
    [{ assignment_id: asg3, student_id: id['gabriel@folclib.test'], status: 'concluido', completed_at: now() }],
    { onConflict: 'assignment_id,student_id' },
  );
  console.log('  2 turmas, 3 prazos, progresso registrado');

  // Contribuicao pendente (para a fila do avaliador)
  await sb.from('contributions').upsert(
    {
      id: 'b1000000-0000-4000-8000-000000000001',
      colaborador_id: id['colab.lia@folclib.test'],
      titulo: 'Relato: Tambor de Crioula',
      descricao: 'Registro de uma roda de Tambor de Crioula no Maranhao.',
      arquivos: [{ nome: 'tambor.jpg', url: 'https://exemplo.test/tambor.jpg' }],
      status: 'recebida',
    },
    { onConflict: 'id' },
  );
  console.log('  1 contribuicao pendente');

  console.log('\nSeed concluido. Login (senha ' + PASSWORD + '):');
  console.log('  avaliador@folclib.test | prof.ana@folclib.test | colab.joao@folclib.test | bia@folclib.test ...');
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error('Falha no seed:', e);
    process.exit(1);
  },
);
