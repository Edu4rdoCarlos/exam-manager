import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { createHash } from 'crypto';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/database/prisma.service';
import { apiKeyMiddleware } from '../../src/shared/middleware/apiKeyMiddleware';

const TEST_API_KEY = 'test-api-key';
const TEACHER_EMAIL = 'students-teacher-e2e@test.com';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('Students (e2e)', () => {
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

    const leftoverUser = await prisma.user.findUnique({ where: { email: TEACHER_EMAIL } });
    if (leftoverUser) {
      await prisma.user.delete({ where: { id: leftoverUser.id } });
    }
    await prisma.student.deleteMany({ where: { cpf: { startsWith: '000.000.' } } });

    const teacher = await prisma.user.create({
      data: { name: 'Students Teacher', email: TEACHER_EMAIL, passwordHash: sha256('password123') },
    });
    teacherId = teacher.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-API-Key', TEST_API_KEY)
      .send({ email: TEACHER_EMAIL, password: 'password123' });
    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.student.deleteMany({ where: { cpf: { startsWith: '000.000.' } } });
    await prisma.user.deleteMany({ where: { id: teacherId } });
    await app.close();
  });

  describe('POST /students', () => {
    it('returns 403 when X-API-Key header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/students')
        .send({ name: 'Test Student', cpf: '000.000.001-00' });

      expect(response.status).toBe(403);
    });

    it('returns 400 when body is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/students')
        .set('X-API-Key', TEST_API_KEY)
        .send({});

      expect(response.status).toBe(400);
    });

    it('returns 400 when name is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/students')
        .set('X-API-Key', TEST_API_KEY)
        .send({ cpf: '000.000.001-00' });

      expect(response.status).toBe(400);
    });

    it('returns 400 when cpf is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/students')
        .set('X-API-Key', TEST_API_KEY)
        .send({ name: 'Test Student' });

      expect(response.status).toBe(400);
    });

    it('returns 201 with student data', async () => {
      const response = await request(app.getHttpServer())
        .post('/students')
        .set('X-API-Key', TEST_API_KEY)
        .send({ name: 'E2E Student', cpf: '000.000.002-00' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        data: {
          id: expect.any(String),
          name: 'E2E Student',
          cpf: '000.000.002-00',
        },
      });
    });

    it('returns 409 when CPF is already in use', async () => {
      await request(app.getHttpServer())
        .post('/students')
        .set('X-API-Key', TEST_API_KEY)
        .send({ name: 'First Student', cpf: '000.000.003-00' });

      const response = await request(app.getHttpServer())
        .post('/students')
        .set('X-API-Key', TEST_API_KEY)
        .send({ name: 'Duplicate Student', cpf: '000.000.003-00' });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /students/:id', () => {
    let studentId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/students')
        .set('X-API-Key', TEST_API_KEY)
        .send({ name: 'Get Student E2E', cpf: '000.000.004-00' });
      studentId = res.body.data.id;
    });

    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer())
        .get(`/students/${studentId}`)
        .set('X-API-Key', TEST_API_KEY);

      expect(response.status).toBe(401);
    });

    it('returns 404 when student does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/students/00000000-0000-0000-0000-000000000000')
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('returns 200 with student data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/students/${studentId}`)
        .set('X-API-Key', TEST_API_KEY)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          id: studentId,
          name: 'Get Student E2E',
          cpf: '000.000.004-00',
        },
      });
    });
  });
});
