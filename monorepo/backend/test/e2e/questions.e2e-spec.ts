import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { createHash, randomUUID } from 'crypto';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/database/prisma.service';
import { apiKeyMiddleware } from '../../src/shared/middleware/apiKeyMiddleware';

const TEST_API_KEY = 'test-api-key';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

const twoAlternatives = [
  { description: 'Option A', isCorrect: false },
  { description: 'Option B', isCorrect: true },
];

describe('Questions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let teacherId: string;

  beforeAll(async () => {
    process.env.EXAM_MANAGER_API_KEY = TEST_API_KEY;

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.use(apiKeyMiddleware);
    await app.init();

    prisma = module.get(PrismaService);

    const teacher = await prisma.user.create({
      data: { name: 'Question Teacher', email: 'question-teacher-e2e@test.com', passwordHash: sha256('password123') },
    });
    teacherId = teacher.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-API-Key', TEST_API_KEY)
      .send({ email: 'question-teacher-e2e@test.com', password: 'password123' });
    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.examQuestion.deleteMany({ where: { exam: { teacherId } } });
    await prisma.exam.deleteMany({ where: { teacherId } });
    const questions = await prisma.question.findMany({ where: { statement: { startsWith: 'E2E:' } } });
    const questionIds = questions.map((q) => q.id);
    await prisma.alternative.deleteMany({ where: { questionId: { in: questionIds } } });
    await prisma.question.deleteMany({ where: { id: { in: questionIds } } });
    await prisma.user.deleteMany({ where: { id: teacherId } });
    await app.close();
  });

  const createQuestion = (overrides: object = {}) =>
    request(app.getHttpServer())
      .post('/questions')
      .set('X-API-Key', TEST_API_KEY)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ statement: 'E2E: What is 2+2?', alternatives: twoAlternatives, ...overrides });

  describe('POST /questions', () => {
    it('returns 403 when X-API-Key header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/questions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ statement: 'E2E: test', alternatives: twoAlternatives });

      expect(response.status).toBe(403);
    });

    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/questions')
        .set('X-API-Key', TEST_API_KEY)
        .send({ statement: 'E2E: test', alternatives: twoAlternatives });

      expect(response.status).toBe(401);
    });

    it('returns 400 when body is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/questions')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('returns 400 when statement is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/questions')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ alternatives: twoAlternatives });

      expect(response.status).toBe(400);
    });

    it('returns 400 when alternatives are missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/questions')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ statement: 'E2E: test' });

      expect(response.status).toBe(400);
    });

    it('returns 400 when an alternative is missing isCorrect field', async () => {
      const response = await request(app.getHttpServer())
        .post('/questions')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ statement: 'E2E: test', alternatives: [{ description: 'Only text' }] });

      expect(response.status).toBe(400);
    });

    it('returns 201 with question data including alternatives', async () => {
      const response = await createQuestion();

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        data: {
          id: expect.any(String),
          statement: 'E2E: What is 2+2?',
          alternatives: expect.arrayContaining([
            expect.objectContaining({ description: 'Option A', isCorrect: false }),
            expect.objectContaining({ description: 'Option B', isCorrect: true }),
          ]),
        },
      });
      expect(response.body.data.alternatives).toHaveLength(2);
    });
  });

  describe('GET /questions', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/questions')
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 200 with paginated list of questions', async () => {
      await createQuestion({ statement: 'E2E: List question 1' });
      await createQuestion({ statement: 'E2E: List question 2' });

      const response = await request(app.getHttpServer())
        .get('/questions')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: expect.any(Array),
        metadata: {
          total: expect.any(Number),
          page: 1,
          limit: expect.any(Number),
          totalPages: 1,
        },
      });
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0]).toMatchObject({
        id: expect.any(String),
        statement: expect.any(String),
        alternatives: expect.any(Array),
      });
    });
  });

  describe('GET /questions/:id', () => {
    let questionId: string;

    beforeAll(async () => {
      const res = await createQuestion({ statement: 'E2E: Get by ID question' });
      questionId = res.body.data.id;
    });

    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get(`/questions/${questionId}`)
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 404 when question does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/questions/00000000-0000-0000-0000-000000000000')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('returns 200 with question data and alternatives', async () => {
      const response = await request(app.getHttpServer())
        .get(`/questions/${questionId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          id: questionId,
          statement: 'E2E: Get by ID question',
          alternatives: expect.arrayContaining([
            expect.objectContaining({ description: 'Option A', isCorrect: false }),
            expect.objectContaining({ description: 'Option B', isCorrect: true }),
          ]),
        },
      });
    });
  });

  describe('PATCH /questions/:id', () => {
    let questionId: string;

    beforeAll(async () => {
      const res = await createQuestion({ statement: 'E2E: Original statement' });
      questionId = res.body.data.id;
    });

    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/questions/${questionId}`)
        .set('X-API-Key', TEST_API_KEY)
        .send({ statement: 'Updated' });

      expect(response.status).toBe(401);
    });

    it('returns 404 when question does not exist', async () => {
      const response = await request(app.getHttpServer())
        .patch('/questions/00000000-0000-0000-0000-000000000000')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ statement: 'Updated' });

      expect(response.status).toBe(404);
    });

    it('returns 200 and updates only the statement', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/questions/${questionId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ statement: 'E2E: Updated statement' });

      expect(response.status).toBe(200);
      expect(response.body.data.statement).toBe('E2E: Updated statement');
      expect(response.body.data.alternatives).toHaveLength(2);
    });

    it('returns 200 and replaces all alternatives when provided', async () => {
      const newAlternatives = [
        { description: 'New X', isCorrect: true },
        { description: 'New Y', isCorrect: false },
        { description: 'New Z', isCorrect: false },
      ];

      const response = await request(app.getHttpServer())
        .patch(`/questions/${questionId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ alternatives: newAlternatives });

      expect(response.status).toBe(200);
      expect(response.body.data.statement).toBe('E2E: Updated statement');
      expect(response.body.data.alternatives).toHaveLength(3);
      expect(response.body.data.alternatives).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ description: 'New X', isCorrect: true }),
          expect.objectContaining({ description: 'New Y', isCorrect: false }),
          expect.objectContaining({ description: 'New Z', isCorrect: false }),
        ]),
      );
    });
  });

  describe('DELETE /questions/:id', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const res = await createQuestion({ statement: 'E2E: Delete auth test' });
      const id = res.body.data.id;

      const response = await request(app.getHttpServer())
        .delete(`/questions/${id}`)
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 404 when question does not exist', async () => {
      const response = await request(app.getHttpServer())
        .delete('/questions/00000000-0000-0000-0000-000000000000')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('returns 409 when question is used in an exam', async () => {
      const questionRes = await createQuestion({ statement: 'E2E: Question in use' });
      const lockedQuestionId = questionRes.body.data.id;

      await request(app.getHttpServer())
        .post('/exams')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'E2E: Locking Exam',
          subject: 'Testing',
          teacherId,
          answerFormat: 'letters',
          questionIds: [{ questionId: lockedQuestionId, position: 1 }],
        });

      const response = await request(app.getHttpServer())
        .delete(`/questions/${lockedQuestionId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(409);
    });

    it('returns 204 and removes the question on success', async () => {
      const questionRes = await createQuestion({ statement: 'E2E: Question to delete' });
      const id = questionRes.body.data.id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/questions/${id}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteRes.status).toBe(204);
      expect(deleteRes.body).toEqual({});

      const getRes = await request(app.getHttpServer())
        .get(`/questions/${id}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(404);
    });
  });
});
