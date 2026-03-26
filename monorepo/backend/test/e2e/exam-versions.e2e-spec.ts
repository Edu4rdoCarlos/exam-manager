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

describe('Exam Versions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let teacherId: string;
  let examId: string;
  let questionId: string;

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

    const leftoverUser = await prisma.user.findUnique({ where: { email: 'version-teacher-e2e@test.com' } });
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
      const leftoverQuestions = await prisma.question.findMany({ where: { statement: 'E2E version question' } });
      for (const q of leftoverQuestions) {
        await prisma.alternative.deleteMany({ where: { questionId: q.id } });
        await prisma.question.delete({ where: { id: q.id } });
      }
      await prisma.user.delete({ where: { id: leftoverUser.id } });
    }

    const teacher = await prisma.user.create({
      data: { name: 'Version Teacher', email: 'version-teacher-e2e@test.com', passwordHash: sha256('password123') },
    });
    teacherId = teacher.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-API-Key', TEST_API_KEY)
      .send({ email: 'version-teacher-e2e@test.com', password: 'password123' });
    authToken = loginRes.body.data.accessToken;

    const question = await prisma.question.create({
      data: {
        id: randomUUID(),
        statement: 'E2E version question',
        alternatives: {
          create: [
            { id: randomUUID(), description: 'Alt A', isCorrect: false },
            { id: randomUUID(), description: 'Alt B', isCorrect: true },
            { id: randomUUID(), description: 'Alt C', isCorrect: false },
          ],
        },
      },
    });
    questionId = question.id;

    const examRes = await request(app.getHttpServer())
      .post('/exams')
      .set('X-API-Key', TEST_API_KEY)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Version Test Exam',
        subject: 'Testing',
        teacherId,
        answerFormat: 'letters',
        questionIds: [{ questionId, position: 1 }],
      });
    examId = examRes.body.data.id;
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

  describe('POST /exam-versions', () => {
    it('returns 403 when X-API-Key header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/exam-versions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examId, versionNumber: 1 });

      expect(response.status).toBe(403);
    });

    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/exam-versions')
        .set('X-API-Key', TEST_API_KEY)
        .send({ examId, versionNumber: 1 });

      expect(response.status).toBe(401);
    });

    it('returns 400 when body is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/exam-versions')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('returns 400 when examId is not a valid UUID', async () => {
      const response = await request(app.getHttpServer())
        .post('/exam-versions')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examId: 'not-a-uuid', versionNumber: 1 });

      expect(response.status).toBe(400);
    });

    it('returns 400 when versionNumber is not an integer', async () => {
      const response = await request(app.getHttpServer())
        .post('/exam-versions')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examId, versionNumber: 'A' });

      expect(response.status).toBe(400);
    });

    it('returns 404 when exam does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/exam-versions')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examId: '00000000-0000-0000-0000-000000000000', versionNumber: 1 });

      expect(response.status).toBe(404);
    });

    it('returns 201 with shuffled questions and labelled alternatives', async () => {
      const response = await request(app.getHttpServer())
        .post('/exam-versions')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examId, versionNumber: 1 });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        data: {
          id: expect.any(String),
          examId,
          versionNumber: 1,
          examVersionQuestions: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              questionId,
              position: 1,
              examVersionAlternatives: expect.arrayContaining([
                expect.objectContaining({
                  id: expect.any(String),
                  position: expect.any(Number),
                  label: expect.stringMatching(/^[A-C]$/),
                }),
              ]),
            }),
          ]),
        },
      });
      expect(response.body.data.examVersionQuestions[0].examVersionAlternatives).toHaveLength(3);
    });
  });

  describe('GET /exam-versions?examId=', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get(`/exam-versions?examId=${examId}`)
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns paginated list of versions for an exam', async () => {
      await request(app.getHttpServer())
        .post('/exam-versions')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examId, versionNumber: 2 });

      const response = await request(app.getHttpServer())
        .get(`/exam-versions?examId=${examId}`)
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
      expect(response.body.data.every((v: { examId: string }) => v.examId === examId)).toBe(true);
    });

    it('returns empty list when exam has no versions', async () => {
      const emptyExamRes = await request(app.getHttpServer())
        .post('/exams')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Empty Exam',
          subject: 'Testing',
          teacherId,
          answerFormat: 'letters',
          questionIds: [{ questionId, position: 1 }],
        });
      const emptyExamId = emptyExamRes.body.data.id;

      const response = await request(app.getHttpServer())
        .get(`/exam-versions?examId=${emptyExamId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.metadata.total).toBe(0);

      await prisma.examQuestion.deleteMany({ where: { examId: emptyExamId } });
      await prisma.exam.deleteMany({ where: { id: emptyExamId } });
    });
  });

  describe('GET /exam-versions/:id', () => {
    let versionId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/exam-versions')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examId, versionNumber: 3 });
      versionId = res.body.data.id;
    });

    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get(`/exam-versions/${versionId}`)
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 404 when version does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/exam-versions/00000000-0000-0000-0000-000000000000')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('returns 200 with full version data including questions and alternatives', async () => {
      const response = await request(app.getHttpServer())
        .get(`/exam-versions/${versionId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          id: versionId,
          examId,
          versionNumber: 3,
          examVersionQuestions: expect.arrayContaining([
            expect.objectContaining({
              questionId,
              examVersionAlternatives: expect.any(Array),
            }),
          ]),
        },
      });
    });
  });

  describe('GET /exam-versions/:id/pdf', () => {
    let versionId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/exam-versions')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examId, versionNumber: 4 });
      versionId = res.body.data.id;
    });

    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get(`/exam-versions/${versionId}/pdf`)
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 404 when version does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/exam-versions/00000000-0000-0000-0000-000000000000/pdf')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('returns 200 with a PDF binary response', async () => {
      const response = await request(app.getHttpServer())
        .get(`/exam-versions/${versionId}/pdf`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .buffer(true)
        .parse((res, callback) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => callback(null, Buffer.concat(chunks)));
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain(`exam-version-${versionId}.pdf`);
      expect((response.body as Buffer).length).toBeGreaterThan(0);
      expect((response.body as Buffer).slice(0, 4).toString()).toBe('%PDF');
    });
  });
});
