import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { createHash, randomUUID } from 'crypto';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/database/prisma.service';
import { apiKeyMiddleware } from '../../src/shared/middleware/apiKeyMiddleware';

const TEST_API_KEY = 'test-api-key';
const TEACHER_EMAIL = 'corrections-teacher-e2e@test.com';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('Corrections (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let teacherId: string;
  let studentId: string;
  let questionId: string;
  let examId: string;
  let examVersionId: string;
  let examVersionQuestionId: string;
  let correctionId: string;

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

    const leftoverUser = await prisma.user.findUnique({ where: { email: TEACHER_EMAIL } });
    if (leftoverUser) {
      const leftoverExams = await prisma.exam.findMany({ where: { teacherId: leftoverUser.id } });
      for (const exam of leftoverExams) {
        const versions = await prisma.examVersion.findMany({ where: { examId: exam.id } });
        const versionIds = versions.map((v) => v.id);
        await prisma.grade.deleteMany({ where: { examVersionId: { in: versionIds } } });
        await prisma.studentAnswer.deleteMany({ where: { examVersionId: { in: versionIds } } });
        await prisma.answerKey.deleteMany({ where: { examVersionId: { in: versionIds } } });
        await prisma.examVersionAlternative.deleteMany({ where: { examVersionQuestion: { examVersionId: { in: versionIds } } } });
        await prisma.examVersionQuestion.deleteMany({ where: { examVersionId: { in: versionIds } } });
        await prisma.examVersion.deleteMany({ where: { examId: exam.id } });
        await prisma.correction.deleteMany({ where: { examId: exam.id } });
        await prisma.examQuestion.deleteMany({ where: { examId: exam.id } });
      }
      await prisma.exam.deleteMany({ where: { teacherId: leftoverUser.id } });
      await prisma.user.delete({ where: { id: leftoverUser.id } });
    }
    await prisma.student.deleteMany({ where: { cpf: '000.222.001-00' } });

    const teacher = await prisma.user.create({
      data: { name: 'Correction Teacher', email: TEACHER_EMAIL, passwordHash: sha256('password123') },
    });
    teacherId = teacher.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-API-Key', TEST_API_KEY)
      .send({ email: TEACHER_EMAIL, password: 'password123' });
    authToken = loginRes.body.data.accessToken;

    const studentRes = await request(app.getHttpServer())
      .post('/students')
      .set('X-API-Key', TEST_API_KEY)
      .send({ name: 'Correction Student', cpf: '000.222.001-00' });
    studentId = studentRes.body.data.id;

    const question = await prisma.question.create({
      data: {
        id: randomUUID(),
        statement: 'E2E Correction question',
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
      .send({ title: 'Correction Exam', subject: 'Testing', teacherId, answerFormat: 'letters', questionIds: [{ questionId, position: 1 }] });
    examId = examRes.body.data.id;

    const versionRes = await request(app.getHttpServer())
      .post('/exam-versions')
      .set('X-API-Key', TEST_API_KEY)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ examId, versionNumber: 1 });
    examVersionId = versionRes.body.data.id;
    examVersionQuestionId = versionRes.body.data.examVersionQuestions[0].id;

    await request(app.getHttpServer())
      .post('/answer-keys')
      .set('X-API-Key', TEST_API_KEY)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ examVersionId, keys: [{ examVersionQuestionId, correctAnswer: 'B' }] });

    await request(app.getHttpServer())
      .post('/student-answers')
      .set('X-API-Key', TEST_API_KEY)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ studentId, examVersionId, answers: [{ questionId, answer: 'B' }] });
  });

  afterAll(async () => {
    await prisma.grade.deleteMany({ where: { examVersionId } });
    await prisma.studentAnswer.deleteMany({ where: { examVersionId } });
    await prisma.answerKey.deleteMany({ where: { examVersion: { examId } } });
    await prisma.correction.deleteMany({ where: { examId } });
    await prisma.examVersionAlternative.deleteMany({ where: { examVersionQuestion: { examVersion: { examId } } } });
    await prisma.examVersionQuestion.deleteMany({ where: { examVersion: { examId } } });
    await prisma.examVersion.deleteMany({ where: { examId } });
    await prisma.examQuestion.deleteMany({ where: { examId } });
    await prisma.exam.deleteMany({ where: { id: examId } });
    await prisma.alternative.deleteMany({ where: { questionId } });
    await prisma.question.deleteMany({ where: { id: questionId } });
    await prisma.student.deleteMany({ where: { id: studentId } });
    await prisma.user.deleteMany({ where: { id: teacherId } });
    await app.close();
  });

  describe('POST /corrections', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/corrections')
        .set('X-API-Key', TEST_API_KEY)
        .send({ examId, correctionMode: 'strict' });

      expect(response.status).toBe(401);
    });

    it('returns 400 when body is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/corrections')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('returns 400 when correctionMode is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/corrections')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examId, correctionMode: 'invalid' });

      expect(response.status).toBe(400);
    });

    it('returns 404 when exam does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/corrections')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examId: '00000000-0000-0000-0000-000000000000', correctionMode: 'strict' });

      expect(response.status).toBe(404);
    });

    it('returns 201 with correction data', async () => {
      const response = await request(app.getHttpServer())
        .post('/corrections')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examId, correctionMode: 'strict' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        data: {
          id: expect.any(String),
          examId,
          correctionMode: 'strict',
        },
      });

      correctionId = response.body.data.id;
    });
  });

  describe('GET /corrections/:id', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get(`/corrections/${correctionId}`)
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 404 when correction does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/corrections/00000000-0000-0000-0000-000000000000')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('returns 200 with correction data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/corrections/${correctionId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          id: correctionId,
          examId,
          correctionMode: 'strict',
        },
      });
    });
  });

  describe('POST /corrections/:id/apply', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post(`/corrections/${correctionId}/apply`)
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 404 when correction does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/corrections/00000000-0000-0000-0000-000000000000/apply')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('returns 201 with grades count', async () => {
      const response = await request(app.getHttpServer())
        .post(`/corrections/${correctionId}/apply`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        data: {
          gradesCount: expect.any(Number),
        },
      });
      expect(response.body.data.gradesCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /corrections/:id/apply-from-csv', () => {
    let csvCorrectionId: string;

    beforeAll(async () => {
      const corrRes = await request(app.getHttpServer())
        .post('/corrections')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ examId, correctionMode: 'lenient' });
      csvCorrectionId = corrRes.body.data.id;
    });

    it('returns 401 when Authorization header is missing', async () => {
      const csvContent = `cpf,examVersionId,q1\n000.222.001-00,${examVersionId},B`;
      const response = await request(app.getHttpServer())
        .post(`/corrections/${csvCorrectionId}/apply-from-csv`)
        .set('X-API-Key', TEST_API_KEY)
        .attach('file', Buffer.from(csvContent), 'answers.csv');

      expect(response.status).toBe(401);
    });

    it('returns 404 when correction does not exist', async () => {
      const csvContent = `cpf,examVersionId,q1\n000.222.001-00,${examVersionId},B`;
      const response = await request(app.getHttpServer())
        .post('/corrections/00000000-0000-0000-0000-000000000000/apply-from-csv')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from(csvContent), 'answers.csv');

      expect(response.status).toBe(404);
    });

    it('returns 201 with grades count when CSV is valid', async () => {
      const csvContent = `cpf,examVersionId,q1\n000.222.001-00,${examVersionId},B`;
      const response = await request(app.getHttpServer())
        .post(`/corrections/${csvCorrectionId}/apply-from-csv`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from(csvContent), 'answers.csv');

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        data: {
          gradesCount: expect.any(Number),
        },
      });
    });
  });
});
