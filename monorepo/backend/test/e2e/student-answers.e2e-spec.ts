import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { createHash, randomUUID } from 'crypto';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/database/prisma.service';
import { apiKeyMiddleware } from '../../src/shared/middleware/apiKeyMiddleware';

const TEST_API_KEY = 'test-api-key';
const TEACHER_EMAIL = 'student-answers-teacher-e2e@test.com';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('Student Answers (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let teacherId: string;
  let studentId: string;
  let questionId: string;
  let examId: string;
  let examVersionId: string;

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
        await prisma.studentAnswer.deleteMany({ where: { examVersionId: { in: (await prisma.examVersion.findMany({ where: { examId: exam.id } })).map((v) => v.id) } } });
        await prisma.answerKey.deleteMany({ where: { examVersion: { examId: exam.id } } });
        await prisma.examVersionAlternative.deleteMany({ where: { examVersionQuestion: { examVersion: { examId: exam.id } } } });
        await prisma.examVersionQuestion.deleteMany({ where: { examVersion: { examId: exam.id } } });
        await prisma.examVersion.deleteMany({ where: { examId: exam.id } });
        await prisma.examQuestion.deleteMany({ where: { examId: exam.id } });
      }
      await prisma.exam.deleteMany({ where: { teacherId: leftoverUser.id } });
      await prisma.user.delete({ where: { id: leftoverUser.id } });
    }
    await prisma.student.deleteMany({ where: { cpf: '000.111.001-00' } });

    const teacher = await prisma.user.create({
      data: { name: 'SA Teacher', email: TEACHER_EMAIL, passwordHash: sha256('password123') },
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
      .send({ name: 'Answer Student', cpf: '000.111.001-00' });
    studentId = studentRes.body.data.id;

    const question = await prisma.question.create({
      data: {
        id: randomUUID(),
        statement: 'E2E SA question',
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
      .send({ title: 'SA Exam', subject: 'Testing', teacherId, answerFormat: 'letters', questionIds: [{ questionId, position: 1 }] });
    examId = examRes.body.data.id;

    const versionRes = await request(app.getHttpServer())
      .post('/exam-versions')
      .set('X-API-Key', TEST_API_KEY)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ examId, versionNumber: 1 });
    examVersionId = versionRes.body.data.id;
  });

  afterAll(async () => {
    await prisma.studentAnswer.deleteMany({ where: { examVersionId } });
    await prisma.answerKey.deleteMany({ where: { examVersion: { examId } } });
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

  describe('POST /student-answers', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/student-answers')
        .set('X-API-Key', TEST_API_KEY)
        .send({ studentId, examVersionId, answers: [{ questionId, answer: 'B' }] });

      expect(response.status).toBe(401);
    });

    it('returns 400 when body is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/student-answers')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('returns 400 when studentId is not a valid UUID', async () => {
      const response = await request(app.getHttpServer())
        .post('/student-answers')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ studentId: 'not-a-uuid', examVersionId, answers: [{ questionId, answer: 'B' }] });

      expect(response.status).toBe(400);
    });

    it('returns 400 when answers array is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/student-answers')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ studentId, examVersionId });

      expect(response.status).toBe(400);
    });

    it('returns 201 with list of submitted answers', async () => {
      const response = await request(app.getHttpServer())
        .post('/student-answers')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ studentId, examVersionId, answers: [{ questionId, answer: 'B' }] });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            studentId,
            examVersionId,
            questionId,
            answer: 'B',
          }),
        ]),
        metadata: { total: 1, page: 1, totalPages: 1 },
      });
    });
  });
});
