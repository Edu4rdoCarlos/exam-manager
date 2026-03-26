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

describe('Answer Keys (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let teacherId: string;
  let questionId: string;
  let examId: string;
  let examVersionId: string;
  let examVersionQuestionId: string;

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

    const leftoverUser = await prisma.user.findUnique({ where: { email: 'keys-teacher-e2e@test.com' } });
    if (leftoverUser) {
      const leftoverExams = await prisma.exam.findMany({ where: { teacherId: leftoverUser.id } });
      for (const exam of leftoverExams) {
        await prisma.answerKey.deleteMany({ where: { examVersion: { examId: exam.id } } });
        await prisma.examVersionAlternative.deleteMany({ where: { examVersionQuestion: { examVersion: { examId: exam.id } } } });
        await prisma.examVersionQuestion.deleteMany({ where: { examVersion: { examId: exam.id } } });
        await prisma.examVersion.deleteMany({ where: { examId: exam.id } });
        await prisma.examQuestion.deleteMany({ where: { examId: exam.id } });
      }
      await prisma.exam.deleteMany({ where: { teacherId: leftoverUser.id } });
      const leftoverQuestions = await prisma.question.findMany({ where: { statement: 'E2E answer key question' } });
      for (const q of leftoverQuestions) {
        await prisma.alternative.deleteMany({ where: { questionId: q.id } });
        await prisma.question.delete({ where: { id: q.id } });
      }
      await prisma.user.delete({ where: { id: leftoverUser.id } });
    }

    const teacher = await prisma.user.create({
      data: { name: 'Keys Teacher', email: 'keys-teacher-e2e@test.com', passwordHash: sha256('password123') },
    });
    teacherId = teacher.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-API-Key', TEST_API_KEY)
      .send({ email: 'keys-teacher-e2e@test.com', password: 'password123' });
    authToken = loginRes.body.data.accessToken;

    const question = await prisma.question.create({
      data: {
        id: randomUUID(),
        statement: 'E2E answer key question',
        alternatives: {
          create: [
            { id: randomUUID(), description: 'Alt A', isCorrect: false },
            { id: randomUUID(), description: 'Alt B', isCorrect: true },
          ],
        },
      },
    });
    questionId = question.id;

    const examRes = await request(app.getHttpServer())
      .post('/exams')
      .set('X-API-Key', TEST_API_KEY)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Keys Exam', subject: 'Testing', teacherId, answerFormat: 'letters', questionIds: [{ questionId, position: 1 }] });
    examId = examRes.body.data.id;

    const versionRes = await request(app.getHttpServer())
      .post('/exam-versions')
      .set('X-API-Key', TEST_API_KEY)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ examId, versionNumber: 1 });

    examVersionId = versionRes.body.data.id;
    examVersionQuestionId = versionRes.body.data.examVersionQuestions[0].id;
  });

  afterAll(async () => {
    await prisma.answerKey.deleteMany({ where: { examVersion: { examId } } });
    await prisma.examVersionAlternative.deleteMany({ where: { examVersionQuestion: { examVersion: { examId } } } });
    await prisma.examVersionQuestion.deleteMany({ where: { examVersion: { examId } } });
    await prisma.examVersion.deleteMany({ where: { examId } });
    await prisma.examQuestion.deleteMany({ where: { examId } });
    await prisma.exam.deleteMany({ where: { id: examId } });
    await prisma.alternative.deleteMany({ where: { questionId } });
    await prisma.question.deleteMany({ where: { id: questionId } });
    await prisma.user.deleteMany({ where: { id: teacherId } });
    await app.close();
  });

  describe('POST /answer-keys', () => {
    it('returns 403 when X-API-Key header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/answer-keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examVersionId, keys: [{ examVersionQuestionId, correctAnswer: 'A' }] });

      expect(response.status).toBe(403);
    });

    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/answer-keys')
        .set('X-API-Key', TEST_API_KEY)
        .send({ examVersionId, keys: [{ examVersionQuestionId, correctAnswer: 'A' }] });

      expect(response.status).toBe(401);
    });

    it('returns 400 when body is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/answer-keys')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('returns 400 when examVersionId is not a valid UUID', async () => {
      const response = await request(app.getHttpServer())
        .post('/answer-keys')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examVersionId: 'not-a-uuid', keys: [{ examVersionQuestionId, correctAnswer: 'A' }] });

      expect(response.status).toBe(400);
    });

    it('returns 400 when keys array is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/answer-keys')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examVersionId });

      expect(response.status).toBe(400);
    });

    it('returns 400 when a key item is missing examVersionQuestionId', async () => {
      const response = await request(app.getHttpServer())
        .post('/answer-keys')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examVersionId, keys: [{ correctAnswer: 'A' }] });

      expect(response.status).toBe(400);
    });

    it('returns 201 with list of created answer keys', async () => {
      const response = await request(app.getHttpServer())
        .post('/answer-keys')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examVersionId, keys: [{ examVersionQuestionId, correctAnswer: 'B' }] });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            examVersionId,
            examVersionQuestionId,
            correctAnswer: 'B',
          }),
        ]),
        metadata: { total: 1, page: 1, totalPages: 1 },
      });
    });
  });

  describe('GET /answer-keys/exam-version/:examVersionId', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get(`/answer-keys/exam-version/${examVersionId}`)
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 200 with paginated answer keys for the exam version', async () => {
      const response = await request(app.getHttpServer())
        .get(`/answer-keys/exam-version/${examVersionId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            examVersionId,
            examVersionQuestionId,
            correctAnswer: 'B',
          }),
        ]),
        metadata: expect.objectContaining({ total: expect.any(Number), page: 1 }),
      });
    });

    it('returns 200 with empty list for a version with no answer keys', async () => {
      const emptyVersionRes = await request(app.getHttpServer())
        .post('/exam-versions')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examId, versionNumber: 2 });
      const emptyVersionId = emptyVersionRes.body.data.id;
      await prisma.answerKey.deleteMany({ where: { examVersionId: emptyVersionId } });

      const response = await request(app.getHttpServer())
        .get(`/answer-keys/exam-version/${emptyVersionId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.metadata.total).toBe(0);
    });
  });

  describe('GET /answer-keys/exam-version/:examVersionId/csv', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get(`/answer-keys/exam-version/${examVersionId}/csv`)
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 404 when exam version does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/answer-keys/exam-version/00000000-0000-0000-0000-000000000000/csv')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('returns 200 with CSV content for the exam version', async () => {
      const response = await request(app.getHttpServer())
        .get(`/answer-keys/exam-version/${examVersionId}/csv`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain(`answer-key-${examVersionId}.csv`);

      const lines = (response.text as string).trim().split('\n');
      expect(lines[0]).toMatch(/^version,q\d+/);
      expect(lines[1]).toMatch(/^1,/);
    });
  });
});
