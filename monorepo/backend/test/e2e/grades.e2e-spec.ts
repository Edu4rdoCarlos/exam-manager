import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { createHash, randomUUID } from 'crypto';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/database/prisma.service';
import { apiKeyMiddleware } from '../../src/shared/middleware/apiKeyMiddleware';

const TEST_API_KEY = 'test-api-key';
const TEACHER_EMAIL = 'grades-teacher-e2e@test.com';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('Grades (e2e)', () => {
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
    process.env.API_KEY = TEST_API_KEY;

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
    await prisma.student.deleteMany({ where: { cpf: '000.333.001-00' } });

    const teacher = await prisma.user.create({
      data: { name: 'Grades Teacher', email: TEACHER_EMAIL, passwordHash: sha256('password123') },
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
      .send({ name: 'Grades Student', cpf: '000.333.001-00' });
    studentId = studentRes.body.data.id;

    const question = await prisma.question.create({
      data: {
        id: randomUUID(),
        statement: 'E2E Grades question',
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
      .send({ title: 'Grades Exam', subject: 'Testing', teacherId, answerFormat: 'letters', questionIds: [{ questionId, position: 1 }] });
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

    const correctionRes = await request(app.getHttpServer())
      .post('/corrections')
      .set('X-API-Key', TEST_API_KEY)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ examId, correctionMode: 'strict' });
    correctionId = correctionRes.body.data.id;

    await request(app.getHttpServer())
      .post(`/corrections/${correctionId}/apply`)
      .set('X-API-Key', TEST_API_KEY)
      .set('Authorization', `Bearer ${authToken}`);
  });

  afterAll(async () => {
    await prisma.grade.deleteMany({ where: { correctionId } });
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

  describe('GET /grades/exam-version/:examVersionId', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get(`/grades/exam-version/${examVersionId}`)
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 200 with empty list for a version with no grades', async () => {
      const response = await request(app.getHttpServer())
        .get('/grades/exam-version/00000000-0000-0000-0000-000000000000')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('returns 200 with grades for the exam version', async () => {
      const response = await request(app.getHttpServer())
        .get(`/grades/exam-version/${examVersionId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            studentId,
            examVersionId,
            correctionId,
            score: expect.any(Number),
          }),
        ]),
        metadata: expect.objectContaining({ total: expect.any(Number) }),
      });
    });
  });

  describe('GET /grades/correction/:correctionId', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get(`/grades/correction/${correctionId}`)
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 200 with empty list for a correction with no grades', async () => {
      const response = await request(app.getHttpServer())
        .get('/grades/correction/00000000-0000-0000-0000-000000000000')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('returns 200 with grades for the correction', async () => {
      const response = await request(app.getHttpServer())
        .get(`/grades/correction/${correctionId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            studentId,
            correctionId,
            score: 1,
          }),
        ]),
      });
    });
  });

  describe('GET /grades/report/correction/:correctionId', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get(`/grades/report/correction/${correctionId}`)
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 200 with empty list for a correction with no grades', async () => {
      const response = await request(app.getHttpServer())
        .get('/grades/report/correction/00000000-0000-0000-0000-000000000000')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('returns 200 with full grade report including student, exam and version data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/grades/report/correction/${correctionId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            gradeId: expect.any(String),
            score: 1,
            correctionId,
            student: expect.objectContaining({
              id: studentId,
              name: 'Grades Student',
              cpf: '000.333.001-00',
            }),
            exam: expect.objectContaining({
              id: examId,
              title: 'Grades Exam',
              subject: 'Testing',
            }),
            examVersion: expect.objectContaining({
              id: examVersionId,
              versionNumber: 1,
            }),
          }),
        ]),
        metadata: expect.objectContaining({ total: expect.any(Number) }),
      });
    });
  });
});
