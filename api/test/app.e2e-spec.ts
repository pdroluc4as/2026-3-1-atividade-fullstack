import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('API readiness (e2e)', () => {
  let app: INestApplication;

  const dbFileName = 'test-e2e.db';
  const dbFilePath = path.join(process.cwd(), dbFileName);

  beforeEach(async () => {
    process.env.DB_FILE_NAME = `file:${dbFileName}`;
    await fs.rm(dbFilePath, { force: true });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    await fs.rm(dbFilePath, { force: true });
    delete process.env.DB_FILE_NAME;
  });

  const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

  it('registers, logs in and lists users only with a valid token', async () => {
    const registerPayload = {
      username: 'alice',
      password: '123456',
      fullName: 'Alice Silva',
      bio: 'Desenvolvedora',
    };

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerPayload)
      .expect(201);

    expect(registerResponse.body).toHaveProperty('access_token');
    expect(registerResponse.body).toHaveProperty('avatarUrl');
    expect(registerResponse.body.avatarUrl).toContain('dicebear.com');

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'alice', password: '123456' })
      .expect(201);

    expect(loginResponse.body).toHaveProperty('access_token');

    await request(app.getHttpServer()).get('/users').expect(401);

    const usersResponse = await request(app.getHttpServer())
      .get('/users')
      .set(authHeader(loginResponse.body.access_token))
      .expect(200);

    expect(usersResponse.body).toHaveLength(1);
    expect(usersResponse.body[0]).toMatchObject({ username: 'alice', fullName: 'Alice Silva' });
    expect(usersResponse.body[0]).toHaveProperty('avatarUrl');
    expect(usersResponse.body[0].avatarUrl).toContain('dicebear.com');
  });

  it('creates a post, comment and rating for an authenticated user', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'bob',
        password: '123456',
        fullName: 'Bob Santos',
      })
      .expect(201);

    const token = registerResponse.body.access_token;

    await request(app.getHttpServer())
      .post('/posts')
      .set(authHeader(token))
      .send({ content: 'Minha primeira publicação' })
      .expect(201);

    const postsResponse = await request(app.getHttpServer())
      .get('/posts')
      .set(authHeader(token))
      .expect(200);

    const postId = postsResponse.body[0].id;
    expect(postId).toBeDefined();

    await request(app.getHttpServer())
      .post('/comments')
      .set(authHeader(token))
      .send({ postId, content: 'Ótimo texto!' })
      .expect(201);

    const commentsResponse = await request(app.getHttpServer())
      .get('/comments')
      .query({ postId })
      .set(authHeader(token))
      .expect(200);

    expect(commentsResponse.body.some((comment: any) => comment.content === 'Ótimo texto!')).toBe(true);

    await request(app.getHttpServer())
      .post('/ratings')
      .set(authHeader(token))
      .send({ postId, rating: 5 })
      .expect(201);

    const ratingsResponse = await request(app.getHttpServer())
      .get(`/ratings/post/${postId}`)
      .set(authHeader(token))
      .expect(200);

    expect(ratingsResponse.body.some((rating: any) => rating.rating === 5)).toBe(true);
  });

  it('lists all comments when no postId filter is provided', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'dora',
        password: '123456',
        fullName: 'Dora Explorer',
      })
      .expect(201);

    const token = registerResponse.body.access_token;

    const postResponse = await request(app.getHttpServer())
      .post('/posts')
      .set(authHeader(token))
      .send({ content: 'Post para listar comentários' })
      .expect(201);

    const postId = postResponse.body.id;

    await request(app.getHttpServer())
      .post('/comments')
      .set(authHeader(token))
      .send({ postId, content: 'Comentário em lista geral' })
      .expect(201);

    await request(app.getHttpServer())
      .get('/comments')
      .set(authHeader(token))
      .expect(200);
  });

  it('accepts numeric values sent as strings in comment and rating payloads', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'charlie2',
        password: '123456',
        fullName: 'Charlie Smith',
      })
      .expect(201);

    const token = registerResponse.body.access_token;

    const postResponse = await request(app.getHttpServer())
      .post('/posts')
      .set(authHeader(token))
      .send({ content: 'Post com dados vindos do frontend' })
      .expect(201);

    const postId = postResponse.body.id;

    await request(app.getHttpServer())
      .post('/comments')
      .set(authHeader(token))
      .send({ postId: String(postId), content: 'Comentário com postId em string' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/ratings')
      .set(authHeader(token))
      .send({ postId: String(postId), rating: '5' })
      .expect(201);
  });

  it('rejects comments and ratings for non-existing posts and duplicate ratings', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'charlie',
        password: '123456',
        fullName: 'Charlie Brown',
      })
      .expect(201);

    const token = registerResponse.body.access_token;

    await request(app.getHttpServer())
      .post('/comments')
      .set(authHeader(token))
      .send({ postId: 9999, content: 'Comentário inválido' })
      .expect(403);

    await request(app.getHttpServer())
      .post('/ratings')
      .set(authHeader(token))
      .send({ postId: 9999, rating: 4 })
      .expect(403);

    await request(app.getHttpServer())
      .post('/posts')
      .set(authHeader(token))
      .send({ content: 'Post para testar regra de avaliação' })
      .expect(201);

    const postsResponse = await request(app.getHttpServer())
      .get('/posts')
      .set(authHeader(token))
      .expect(200);

    const postId = postsResponse.body[0].id;

    await request(app.getHttpServer())
      .post('/ratings')
      .set(authHeader(token))
      .send({ postId, rating: 5 })
      .expect(201);

    await request(app.getHttpServer())
      .post('/ratings')
      .set(authHeader(token))
      .send({ postId, rating: 4 })
      .expect(409);
  });

  it('blocks unauthorized edits and deletions of posts, comments and ratings', async () => {
    const userOne = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'diana', password: '123456', fullName: 'Diana Lima' })
      .expect(201);

    const userTwo = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'edgar', password: '123456', fullName: 'Edgar Lima' })
      .expect(201);

    const postResponse = await request(app.getHttpServer())
      .post('/posts')
      .set(authHeader(userOne.body.access_token))
      .send({ content: 'Conteúdo de D' })
      .expect(201);

    const postsResponse = await request(app.getHttpServer())
      .get('/posts')
      .set(authHeader(userOne.body.access_token))
      .expect(200);

    const postId = postsResponse.body[0].id;

    await request(app.getHttpServer())
      .patch(`/posts/${postId}`)
      .set(authHeader(userTwo.body.access_token))
      .send({ content: 'Tentativa de modificação' })
      .expect(403);

    await request(app.getHttpServer())
      .delete(`/posts/${postId}`)
      .set(authHeader(userTwo.body.access_token))
      .expect(403);

    await request(app.getHttpServer())
      .post('/comments')
      .set(authHeader(userOne.body.access_token))
      .send({ postId, content: 'Comentário do autor' })
      .expect(201);

    const commentsResponse = await request(app.getHttpServer())
      .get('/comments')
      .query({ postId })
      .set(authHeader(userOne.body.access_token))
      .expect(200);

    const commentId = commentsResponse.body.find((comment: any) => comment.content === 'Comentário do autor').id;

    await request(app.getHttpServer())
      .patch(`/comments/${commentId}`)
      .set(authHeader(userTwo.body.access_token))
      .send({ content: 'Mudou o comentário' })
      .expect(403);

    await request(app.getHttpServer())
      .delete(`/comments/${commentId}`)
      .set(authHeader(userTwo.body.access_token))
      .expect(403);

    await request(app.getHttpServer())
      .post('/ratings')
      .set(authHeader(userOne.body.access_token))
      .send({ postId, rating: 4 })
      .expect(201);

    const ratingsResponse = await request(app.getHttpServer())
      .get(`/ratings/post/${postId}`)
      .set(authHeader(userOne.body.access_token))
      .expect(200);

    const ratingId = ratingsResponse.body.find((rating: any) => rating.rating === 4).id;

    await request(app.getHttpServer())
      .patch(`/ratings/${ratingId}`)
      .set(authHeader(userTwo.body.access_token))
      .send({ rating: 5 })
      .expect(403);

    await request(app.getHttpServer())
      .delete(`/ratings/${ratingId}`)
      .set(authHeader(userTwo.body.access_token))
      .expect(403);
  });
});
