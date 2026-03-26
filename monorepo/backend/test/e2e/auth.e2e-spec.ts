import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { createHash } from 'crypto';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/database/prisma.service';
import { apiKeyMiddleware } from '../../src/shared/middleware/apiKeyMiddleware';

const TEST_API_KEY = 'test-api-key';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('POST /auth/login (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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

    await prisma.user.deleteMany({ where: { email: 'teacher@test.com' } });
    await prisma.user.create({
      data: {
        name: 'Test Teacher',
        email: 'teacher@test.com',
        passwordHash: sha256('password123'),
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'teacher@test.com' } });
    await app.close();
  });

  it('returns 403 when X-API-Key header is missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'teacher@test.com', password: 'password123' });

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ statusCode: 403, message: 'Forbidden' });
  });

  it('returns 403 when X-API-Key header is wrong', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-API-Key', 'wrong-key')
      .send({ email: 'teacher@test.com', password: 'password123' });

    expect(response.status).toBe(403);
  });

  it('returns 400 when body is missing required fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-API-Key', TEST_API_KEY)
      .send({});

    expect(response.status).toBe(400);
  });

  it('returns 400 when email format is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-API-Key', TEST_API_KEY)
      .send({ email: 'not-an-email', password: 'password123' });

    expect(response.status).toBe(400);
  });

  it('returns 400 when password is shorter than 8 characters', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-API-Key', TEST_API_KEY)
      .send({ email: 'teacher@test.com', password: 'short' });

    expect(response.status).toBe(400);
  });

  it('returns 401 when email does not exist', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-API-Key', TEST_API_KEY)
      .send({ email: 'nobody@test.com', password: 'password123' });

    expect(response.status).toBe(401);
  });

  it('returns 401 when password is wrong', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-API-Key', TEST_API_KEY)
      .send({ email: 'teacher@test.com', password: 'wrongpassword' });

    expect(response.status).toBe(401);
  });

  it('returns 201 with accessToken when credentials are correct', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-API-Key', TEST_API_KEY)
      .send({ email: 'teacher@test.com', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      data: {
        accessToken: expect.any(String),
      },
    });
    expect(response.body.data.accessToken.length).toBeGreaterThan(0);
  });
});
