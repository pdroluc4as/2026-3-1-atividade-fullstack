import 'dotenv/config';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import bcrypt from 'bcrypt';
import * as schema from './schema.js';
import {
  usersTable,
  postsTable,
  commentsTable,
  postRatingsTable,
} from './schema.js';

const url = process.env.DB_FILE_NAME ?? 'file:local.db';
const client = createClient({ url });
const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ─────────────────────────────────────────────
  // Limpa as tabelas (ordem inversa de dependência)
  // ─────────────────────────────────────────────
  await db.delete(postRatingsTable);
  await db.delete(commentsTable);
  await db.delete(postsTable);
  await db.delete(usersTable);
  console.log('🗑️  Tabelas limpas.\n');

  // ─────────────────────────────────────────────
  // Usuários
  // ─────────────────────────────────────────────
  const SALT_ROUNDS = 10;

  const usersData = [
    {
      username: 'alice',
      password: 'senha123',
      fullName: 'Alice Souza',
      bio: 'Desenvolvedora fullstack apaixonada por open source.',
    },
    {
      username: 'bob',
      password: 'senha123',
      fullName: 'Bob Ferreira',
      bio: 'Entusiasta de DevOps e café ☕',
    },
    {
      username: 'carol',
      password: 'senha123',
      fullName: 'Carol Lima',
      bio: 'Estudante de Ciência da Computação.',
    },
    {
      username: 'david',
      password: 'senha123',
      fullName: 'David Rocha',
      bio: null,
    },
    {
      username: 'eva',
      password: 'senha123',
      fullName: 'Eva Monteiro',
      bio: 'Designer UI/UX que adora React.',
    },
  ];

  const insertedUsers = await db
    .insert(usersTable)
    .values(
      await Promise.all(
        usersData.map(async (u, i) => ({
          username: u.username,
          passwordHash: await bcrypt.hash(u.password, SALT_ROUNDS),
          fullName: u.fullName,
          bio: u.bio,
          avatarUrl: `https://api.dicebear.com/9.x/bottts/svg?seed=${u.username}-${i + 1}`,
          createdAt: new Date(Date.now() - (usersData.length - i) * 86_400_000),
        })),
      ),
    )
    .returning();

  console.log(`👤 ${insertedUsers.length} usuários inseridos.`);

  const [alice, bob, carol, david, eva] = insertedUsers;

  // ─────────────────────────────────────────────
  // Posts
  // ─────────────────────────────────────────────
  const postsData = [
    {
      authorId: alice.id,
      title: 'Começando com Drizzle ORM',
      content:
        'Drizzle ORM é uma alternativa type-safe ao Prisma. Neste post exploro como configurá-lo com SQLite e NestJS para projetos fullstack modernos.',
    },
    {
      authorId: alice.id,
      title: 'Por que escolhi NestJS para minha API',
      content:
        'NestJS traz a estrutura do Angular para o backend Node.js. Com decorators, injeção de dependência e módulos, a organização do código fica muito mais clara.',
    },
    {
      authorId: bob.id,
      title: 'Docker Compose para desenvolvimento local',
      content:
        'Usar Docker Compose elimina o famoso "funciona na minha máquina". Veja como configurar um ambiente com Node, banco de dados e proxy reverso em minutos.',
    },
    {
      authorId: carol.id,
      title: 'Minha primeira contribuição open source',
      content:
        'Contribuir para projetos open source pode parecer intimidador no início, mas é mais simples do que parece. Compartilho aqui minha experiência com o primeiro PR.',
    },
    {
      authorId: david.id,
      title: 'TypeScript generics na prática',
      content:
        'Generics são um dos recursos mais poderosos do TypeScript. Com exemplos práticos, mostro como criar utilitários reutilizáveis e type-safe.',
    },
    {
      authorId: eva.id,
      title: 'Design System com Tailwind CSS',
      content:
        'Tailwind facilita a criação de um design system consistente sem reinventar a roda. Apresento um workflow que uso para manter tokens de design organizados.',
    },
  ];

  const now = Date.now();
  const insertedPosts = await db
    .insert(postsTable)
    .values(
      postsData.map((p, i) => ({
        ...p,
        createdAt: new Date(now - (postsData.length - i) * 3_600_000),
      })),
    )
    .returning();

  console.log(`📝 ${insertedPosts.length} posts inseridos.`);

  const [post1, post2, post3, post4, post5, post6] = insertedPosts;

  // ─────────────────────────────────────────────
  // Avaliações (1–5 estrelas, uma por usuário por post)
  // ─────────────────────────────────────────────
  const ratingsData = [
    // Post 1 – Drizzle ORM
    { postId: post1.id, userId: bob.id,   rating: 5 },
    { postId: post1.id, userId: carol.id, rating: 4 },
    { postId: post1.id, userId: david.id, rating: 5 },
    { postId: post1.id, userId: eva.id,   rating: 3 },
    // Post 2 – NestJS
    { postId: post2.id, userId: bob.id,   rating: 5 },
    { postId: post2.id, userId: carol.id, rating: 4 },
    { postId: post2.id, userId: david.id, rating: 2 },
    // Post 3 – Docker Compose
    { postId: post3.id, userId: alice.id, rating: 5 },
    { postId: post3.id, userId: carol.id, rating: 5 },
    { postId: post3.id, userId: eva.id,   rating: 4 },
    // Post 4 – Open Source
    { postId: post4.id, userId: alice.id, rating: 5 },
    { postId: post4.id, userId: bob.id,   rating: 5 },
    { postId: post4.id, userId: eva.id,   rating: 4 },
    // Post 5 – Generics
    { postId: post5.id, userId: alice.id, rating: 4 },
    { postId: post5.id, userId: carol.id, rating: 3 },
    { postId: post5.id, userId: eva.id,   rating: 5 },
    // Post 6 – Tailwind
    { postId: post6.id, userId: alice.id, rating: 5 },
    { postId: post6.id, userId: bob.id,   rating: 4 },
    { postId: post6.id, userId: carol.id, rating: 5 },
    { postId: post6.id, userId: david.id, rating: 2 },
  ];

  const insertedRatings = await db
    .insert(postRatingsTable)
    .values(
      ratingsData.map((r, i) => ({
        ...r,
        createdAt: new Date(now - (ratingsData.length - i) * 600_000),
      })),
    )
    .returning();

  console.log(`⭐ ${insertedRatings.length} avaliações inseridas.`);

  // ─────────────────────────────────────────────
  // Comentários raiz
  // ─────────────────────────────────────────────
  const rootCommentsData = [
    // Post 1 – Drizzle ORM  [índices 0, 1, 2]
    { postId: post1.id, authorId: bob.id,   content: 'Ótimo post! Estava procurando exatamente isso.' },
    { postId: post1.id, authorId: carol.id, content: 'Você tem algum repositório de exemplo com autenticação JWT?' },
    { postId: post1.id, authorId: david.id, content: 'Como o Drizzle se compara ao Prisma em termos de performance?' },
    // Post 2 – NestJS  [índices 3, 4, 5]
    { postId: post2.id, authorId: david.id, content: 'Concordo! NestJS é incrível para projetos grandes.' },
    { postId: post2.id, authorId: eva.id,   content: 'Já experimentei com Express puro e sinto falta da estrutura do Nest.' },
    { postId: post2.id, authorId: carol.id, content: 'Qual versão você está usando? Tive problemas com a v10 e Fastify.' },
    // Post 3 – Docker Compose  [índices 6, 7, 8]
    { postId: post3.id, authorId: alice.id, content: 'Salvou minha vida em produção! 🙌' },
    { postId: post3.id, authorId: carol.id, content: 'Você usa algum volume para persistência dos dados?' },
    { postId: post3.id, authorId: eva.id,   content: 'Tem como configurar hot-reload do Node dentro do container?' },
    // Post 4 – Open Source  [índices 9, 10, 11]
    { postId: post4.id, authorId: alice.id, content: 'Parabéns pela coragem! A comunidade agradece 💙' },
    { postId: post4.id, authorId: bob.id,   content: 'Qual foi o projeto? Posso ver o PR?' },
    { postId: post4.id, authorId: eva.id,   content: 'Também quero contribuir. Alguma dica de onde começar?' },
    // Post 5 – Generics  [índices 12, 13]
    { postId: post5.id, authorId: eva.id,   content: 'Generics ainda confundem muita gente. Bom tutorial!' },
    { postId: post5.id, authorId: alice.id, content: 'Você poderia mostrar um exemplo com infer? Sempre me perco aí.' },
    // Post 6 – Tailwind  [índices 14, 15, 16]
    { postId: post6.id, authorId: alice.id, content: 'Tailwind é divisor de águas. Nunca mais voltei ao CSS puro.' },
    { postId: post6.id, authorId: bob.id,   content: 'Como você lida com temas escuro/claro no Tailwind v4?' },
    { postId: post6.id, authorId: david.id, content: 'Prefiro Styled Components. Tailwind vira um caos em projetos grandes.' },
  ];

  const rootComments = await db
    .insert(commentsTable)
    .values(
      rootCommentsData.map((c, i) => ({
        ...c,
        parentCommentId: null,
        createdAt: new Date(now - (rootCommentsData.length - i) * 1_800_000),
      })),
    )
    .returning();

  console.log(`💬 ${rootComments.length} comentários raiz inseridos.`);

  // ─────────────────────────────────────────────
  // Respostas aninhadas (nível 1)
  // ─────────────────────────────────────────────
  const repliesData = [
    // Post 1: carol perguntou sobre repo (índice 1), alice responde
    { postId: post1.id, authorId: alice.id, parentCommentId: rootComments[1].id,
      content: 'Sim! Veja em github.com/alice/drizzle-nestjs-example — já tem JWT, refresh token e tudo mais. 🚀' },
    // Post 1: david perguntou sobre performance (índice 2), alice e bob respondem
    { postId: post1.id, authorId: alice.id, parentCommentId: rootComments[2].id,
      content: 'No meu benchmark o Drizzle foi ~20% mais rápido que o Prisma em queries simples. Vale o teste no seu caso.' },
    { postId: post1.id, authorId: bob.id,   parentCommentId: rootComments[2].id,
      content: 'Depende muito do tipo de query. Para joins complexos o Prisma ainda ganha na legibilidade.' },
    // Post 2: carol perguntou sobre versão (índice 5), alice responde
    { postId: post2.id, authorId: alice.id, parentCommentId: rootComments[5].id,
      content: 'Estou na v10 com Fastify sem problemas. O segredo é usar @nestjs/platform-fastify e não misturar middlewares do Express.' },
    // Post 3: carol perguntou sobre volumes (índice 7), bob responde
    { postId: post3.id, authorId: bob.id,   parentCommentId: rootComments[7].id,
      content: 'Sim, uso named volumes para o PostgreSQL e bind mount para o código fonte. Assim o banco persiste entre restarts.' },
    // Post 3: eva perguntou sobre hot-reload (índice 8), bob responde
    { postId: post3.id, authorId: bob.id,   parentCommentId: rootComments[8].id,
      content: 'Com tsx --watch dentro do container e o volume configurado funciona perfeitamente. Vou adicionar um exemplo no post!' },
    // Post 4: bob perguntou sobre o projeto (índice 10), carol responde
    { postId: post4.id, authorId: carol.id, parentCommentId: rootComments[10].id,
      content: 'Foi no repositório do Vitest! Adicionei um caso de teste que faltava numa função de formatação de datas.' },
    // Post 4: eva pediu dicas (índice 11), carol responde
    { postId: post4.id, authorId: carol.id, parentCommentId: rootComments[11].id,
      content: 'Comece pelos issues marcados com "good first issue". São pensados exatamente para quem está começando 😊' },
    // Post 5: alice pediu exemplo de infer (índice 13), david responde
    { postId: post5.id, authorId: david.id, parentCommentId: rootComments[13].id,
      content: 'Claro! type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never. O infer captura o tipo de retorno em tempo de compilação.' },
    // Post 6: bob perguntou sobre dark mode (índice 15), eva responde
    { postId: post6.id, authorId: eva.id,   parentCommentId: rootComments[15].id,
      content: 'Com Tailwind v4 uso a diretiva @variant dark e CSS variables. O arquivo fica limpo e funciona sem JavaScript!' },
    // Post 6: david criticou (índice 16), alice responde
    { postId: post6.id, authorId: alice.id, parentCommentId: rootComments[16].id,
      content: 'Organização é tudo! Com componentes bem separados e um design system definido, o Tailwind escala muito bem.' },
  ];

  const insertedReplies = await db
    .insert(commentsTable)
    .values(
      repliesData.map((r, i) => ({
        ...r,
        createdAt: new Date(now - (repliesData.length - i) * 900_000),
      })),
    )
    .returning();

  console.log(`↩️  ${insertedReplies.length} respostas (nível 1) inseridas.`);

  // ─────────────────────────────────────────────
  // Respostas aninhadas (nível 2 — replies de replies)
  // ─────────────────────────────────────────────
  // insertedReplies[0]  = alice respondeu carol sobre repo (post1)
  // insertedReplies[3]  = alice respondeu carol sobre versão (post2)
  // insertedReplies[9]  = eva respondeu bob sobre dark mode (post6)
  const deepRepliesData = [
    // carol agradece a resposta da alice sobre o repo
    { postId: post1.id, authorId: carol.id, parentCommentId: insertedReplies[0].id,
      content: 'Perfeito! Já clonei e estou testando. Muito obrigada, Alice! ❤️' },
    // david concorda com alice sobre benchmark
    { postId: post1.id, authorId: david.id, parentCommentId: insertedReplies[1].id,
      content: 'Fiz um teste parecido aqui e cheguei nos mesmos números. Vale migrar.' },
    // carol tenta a dica da alice sobre Fastify
    { postId: post2.id, authorId: carol.id, parentCommentId: insertedReplies[3].id,
      content: 'Funcionou! Era exatamente o conflito com o middleware do Express. Valeu! 🎉' },
    // bob confirma a resposta da eva sobre dark mode
    { postId: post6.id, authorId: bob.id,   parentCommentId: insertedReplies[9].id,
      content: 'Acabei de testar e ficou incrível. Vou adotar isso no meu projeto!' },
  ];

  const insertedDeepReplies = await db
    .insert(commentsTable)
    .values(
      deepRepliesData.map((r, i) => ({
        ...r,
        createdAt: new Date(now - (deepRepliesData.length - i) * 300_000),
      })),
    )
    .returning();

  console.log(`↩️↩️  ${insertedDeepReplies.length} respostas (nível 2) inseridas.\n`);

  // ─────────────────────────────────────────────
  // Resumo final
  // ─────────────────────────────────────────────
  const totalComments = rootComments.length + insertedReplies.length + insertedDeepReplies.length;

  console.log('✅ Seed concluído com sucesso!');
  console.log('\nResumo:');
  console.log(`  Usuários           : ${insertedUsers.length}`);
  console.log(`  Posts              : ${insertedPosts.length}`);
  console.log(`  Comentários raiz   : ${rootComments.length}`);
  console.log(`  Respostas nível 1  : ${insertedReplies.length}`);
  console.log(`  Respostas nível 2  : ${insertedDeepReplies.length}`);
  console.log(`  Total comentários  : ${totalComments}`);
  console.log(`  Avaliações         : ${insertedRatings.length}`);

  client.close();
}

seed().catch((err) => {
  console.error('❌ Erro durante o seed:', err);
  client.close();
  process.exit(1);
});
