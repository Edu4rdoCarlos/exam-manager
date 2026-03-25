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

describe('Exams (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let teacherId: string;
  let questionId: string;

  beforeAll(async () => {
    process.env.API_KEY = TEST_API_KEY;

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.use(apiKeyMiddleware);
    await app.init();

    prisma = module.get(PrismaService);

    const teacher = await prisma.user.create({
      data: { name: 'Exam Teacher', email: 'exam-teacher-e2e@test.com', passwordHash: sha256('password123') },
    });
    teacherId = teacher.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-API-Key', TEST_API_KEY)
      .send({ email: 'exam-teacher-e2e@test.com', password: 'password123' });
    authToken = loginRes.body.data.accessToken;

    const question = await prisma.question.create({
      data: {
        id: randomUUID(),
        statement: 'E2E exam test question',
        alternatives: {
          create: [
            { id: randomUUID(), description: 'Option A', isCorrect: false },
            { id: randomUUID(), description: 'Option B', isCorrect: true },
          ],
        },
      },
    });
    questionId = question.id;
  });

  afterAll(async () => {
    await prisma.examVersion.deleteMany({ where: { exam: { teacherId } } });
    await prisma.examQuestion.deleteMany({ where: { exam: { teacherId } } });
    await prisma.exam.deleteMany({ where: { teacherId } });
    await prisma.alternative.deleteMany({ where: { questionId } });
    await prisma.question.deleteMany({ where: { id: questionId } });
    await prisma.user.deleteMany({ where: { id: teacherId } });
    await app.close();
  });

  const validCreatePayload = () => ({
    title: 'Cálculo I',
    subject: 'Matemática',
    teacherId,
    answerFormat: 'letters' as const,
    questionIds: [{ questionId, position: 1 }],
  });

  describe('POST /exams', () => {
    it('returns 403 when X-API-Key header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/exams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validCreatePayload());

      expect(response.status).toBe(403);
    });

    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/exams')
        .set('X-API-Key', TEST_API_KEY)
        .send(validCreatePayload());

      expect(response.status).toBe(401);
    });

    it('returns 400 when body is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/exams')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('returns 400 when answerFormat is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/exams')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validCreatePayload(), answerFormat: 'invalid_format' });

      expect(response.status).toBe(400);
    });

    it('returns 400 when teacherId is not a valid UUID', async () => {
      const response = await request(app.getHttpServer())
        .post('/exams')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validCreatePayload(), teacherId: 'not-a-uuid' });

      expect(response.status).toBe(400);
    });

    it('returns 201 with exam data on success', async () => {
      const response = await request(app.getHttpServer())
        .post('/exams')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send(validCreatePayload());

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        data: {
          id: expect.any(String),
          title: 'Cálculo I',
          subject: 'Matemática',
          teacherId,
          examDate: null,
          answerFormat: 'letters',
        },
      });
    });

    it('returns 201 with exam date when examDate is provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/exams')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validCreatePayload(), examDate: '2026-12-01T10:00:00.000Z' });

      expect(response.status).toBe(201);
      expect(response.body.data.examDate).not.toBeNull();
    });
  });

  describe('GET /exams/:id', () => {
    let examId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/exams')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send(validCreatePayload());
      examId = res.body.data.id;
    });

    it('returns 403 when X-API-Key header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get(`/exams/${examId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });

    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get(`/exams/${examId}`)
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 404 when exam does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/exams/00000000-0000-0000-0000-000000000000')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('returns 200 with exam data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/exams/${examId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          id: examId,
          title: 'Cálculo I',
          subject: 'Matemática',
          teacherId,
          answerFormat: 'letters',
        },
      });
    });
  });

  describe('PATCH /exams/:id', () => {
    let examId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/exams')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send(validCreatePayload());
      examId = res.body.data.id;
    });

    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/exams/${examId}`)
        .set('X-API-Key', TEST_API_KEY)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(401);
    });

    it('returns 404 when exam does not exist', async () => {
      const response = await request(app.getHttpServer())
        .patch('/exams/00000000-0000-0000-0000-000000000000')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
    });

    it('returns 400 when answerFormat value is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/exams/${examId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ answerFormat: 'invalid' });

      expect(response.status).toBe(400);
    });

    it('returns 200 and updates only the provided fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/exams/${examId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Cálculo I — Atualizado', answerFormat: 'powers_of_two' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          id: examId,
          title: 'Cálculo I — Atualizado',
          subject: 'Matemática',
          answerFormat: 'powers_of_two',
          teacherId,
        },
      });
    });

    it('returns 200 and sets examDate to null when explicitly nulled', async () => {
      await request(app.getHttpServer())
        .patch(`/exams/${examId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examDate: '2026-12-01T10:00:00.000Z' });

      const nullRes = await request(app.getHttpServer())
        .patch(`/exams/${examId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examDate: null });

      expect(nullRes.status).toBe(200);
      expect(nullRes.body.data.examDate).toBeNull();
    });
  });

  describe('DELETE /exams/:id', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const examRes = await request(app.getHttpServer())
        .post('/exams')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send(validCreatePayload());
      const id = examRes.body.data.id;

      const response = await request(app.getHttpServer())
        .delete(`/exams/${id}`)
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 404 when exam does not exist', async () => {
      const response = await request(app.getHttpServer())
        .delete('/exams/00000000-0000-0000-0000-000000000000')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('returns 409 when exam has versions and cannot be deleted', async () => {
      const examRes = await request(app.getHttpServer())
        .post('/exams')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send(validCreatePayload());
      const lockedExamId = examRes.body.data.id;

      await prisma.examVersion.create({
        data: { id: randomUUID(), examId: lockedExamId, versionNumber: 1 },
      });

      const response = await request(app.getHttpServer())
        .delete(`/exams/${lockedExamId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(409);
    });

    it('returns 204 and removes the exam on success', async () => {
      const examRes = await request(app.getHttpServer())
        .post('/exams')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send(validCreatePayload());
      const id = examRes.body.data.id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/exams/${id}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteRes.status).toBe(204);
      expect(deleteRes.body).toEqual({});

      const getRes = await request(app.getHttpServer())
        .get(`/exams/${id}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(404);
    });
  });
});
