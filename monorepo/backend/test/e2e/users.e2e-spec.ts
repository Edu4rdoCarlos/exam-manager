import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { createHash } from 'crypto';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/database/prisma.service';
import { apiKeyMiddleware } from '../../src/shared/middleware/apiKeyMiddleware';

const TEST_API_KEY = 'test-api-key';
const TEST_EMAIL = 'user-e2e@test.com';
const AUTH_EMAIL = 'auth-user-e2e@test.com';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let authUserId: string;

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

    const userToClean = await prisma.user.findUnique({ where: { email: AUTH_EMAIL } });
    if (userToClean) {
      await prisma.examQuestion.deleteMany({ where: { exam: { teacherId: userToClean.id } } });
      await prisma.exam.deleteMany({ where: { teacherId: userToClean.id } });
    }
    await prisma.user.deleteMany({ where: { email: { in: [TEST_EMAIL, AUTH_EMAIL] } } });

    const authUser = await prisma.user.create({
      data: { name: 'Auth User', email: AUTH_EMAIL, passwordHash: sha256('password123') },
    });
    authUserId = authUser.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-API-Key', TEST_API_KEY)
      .send({ email: AUTH_EMAIL, password: 'password123' });

    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.examQuestion.deleteMany({ where: { exam: { teacherId: authUserId } } });
    await prisma.exam.deleteMany({ where: { teacherId: authUserId } });
    await prisma.alternative.deleteMany({ where: { question: { statement: 'What is 2+2?' } } });
    await prisma.question.deleteMany({ where: { statement: 'What is 2+2?' } });
    await prisma.user.deleteMany({ where: { email: { in: [TEST_EMAIL, AUTH_EMAIL] } } });
    await app.close();
  });

  describe('POST /users', () => {
    it('returns 403 when X-API-Key header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'John', email: TEST_EMAIL, password: 'password123' });

      expect(response.status).toBe(403);
    });

    it('returns 400 when body is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('X-API-Key', TEST_API_KEY)
        .send({});

      expect(response.status).toBe(400);
    });

    it('returns 400 when name is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('X-API-Key', TEST_API_KEY)
        .send({ email: TEST_EMAIL, password: 'password123' });

      expect(response.status).toBe(400);
    });

    it('returns 400 when email format is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('X-API-Key', TEST_API_KEY)
        .send({ name: 'John', email: 'not-an-email', password: 'password123' });

      expect(response.status).toBe(400);
    });

    it('returns 400 when password is shorter than 8 characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('X-API-Key', TEST_API_KEY)
        .send({ name: 'John', email: TEST_EMAIL, password: 'short' });

      expect(response.status).toBe(400);
    });

    it('returns 201 with user data and does not expose passwordHash', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('X-API-Key', TEST_API_KEY)
        .send({ name: 'John Doe', email: TEST_EMAIL, password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        data: {
          id: expect.any(String),
          name: 'John Doe',
          email: TEST_EMAIL,
        },
      });
      expect(response.body.data).not.toHaveProperty('passwordHash');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('returns 409 when email is already in use', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('X-API-Key', TEST_API_KEY)
        .send({ name: 'Other John', email: TEST_EMAIL, password: 'password123' });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /users/me', () => {
    it('returns 403 when X-API-Key header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });

    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 401 when token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
    });

    it('returns 200 with user data and empty exams list when teacher has no exams', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          id: authUserId,
          name: 'Auth User',
          email: AUTH_EMAIL,
          exams: [],
        },
      });
      expect(response.body.data).not.toHaveProperty('passwordHash');
    });

    it('returns 200 with exams list after teacher creates exams', async () => {
      const questionRes = await request(app.getHttpServer())
        .post('/questions')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          statement: 'What is 2+2?',
          alternatives: [
            { description: '3', isCorrect: false },
            { description: '4', isCorrect: true },
          ],
        });
      const questionId = questionRes.body.data.id;

      await request(app.getHttpServer())
        .post('/exams')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Math Exam',
          subject: 'Mathematics',
          teacherId: authUserId,
          answerFormat: 'letters',
          questionIds: [{ questionId, position: 1 }],
        });

      await request(app.getHttpServer())
        .post('/exams')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Math Exam 2',
          subject: 'Mathematics',
          teacherId: authUserId,
          answerFormat: 'powers_of_two',
          questionIds: [{ questionId, position: 1 }],
        });

      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.exams).toHaveLength(2);
      expect(response.body.data.exams[0]).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        subject: 'Mathematics',
        answerFormat: expect.stringMatching(/^(letters|powers_of_two)$/),
        examDate: null,
      });
    });
  });
});
