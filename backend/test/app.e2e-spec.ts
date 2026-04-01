import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected object response body');
  }
  return value as Record<string, unknown>;
}

function getString(body: unknown, key: string): string {
  const record = asRecord(body);
  const value = record[key];
  if (typeof value !== 'string') {
    throw new Error(`Expected string field: ${key}`);
  }
  return value;
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  }, 15000);

  afterEach(async () => {
    // Clean up database after each test
    await prisma.artisanProfile.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.otp.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
  });

  it('/api/v1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect('Hello World!');
  });

  it('/api/v1/auth/register, verify-otp, login, refresh and me', async () => {
    const email = `test-${Date.now()}@example.com`;
    const password = '12345678';

    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body).toHaveProperty('user');
    expect(registerResponse.body).toHaveProperty('otp');
    const registerOtp = getString(registerResponse.body, 'otp');

    const verifyResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/verify-otp')
      .send({ email, otp: registerOtp });

    expect(verifyResponse.status).toBe(201);
    expect(verifyResponse.body).toEqual({ ok: true });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('accessToken');
    expect(loginResponse.body).toHaveProperty('user');
    expect(loginResponse.get('Set-Cookie')).toBeDefined();

    const accessToken = getString(loginResponse.body, 'accessToken');
    const setCookieHeader: unknown = loginResponse.get('Set-Cookie');
    // Extract just the cookie name=value part, without the attributes
    let cookie = '';
    if (Array.isArray(setCookieHeader)) {
      const firstCookie = setCookieHeader.find(
        (item): item is string => typeof item === 'string',
      );
      if (firstCookie) {
        cookie = firstCookie.split(';')[0];
      }
    } else if (typeof setCookieHeader === 'string') {
      cookie = setCookieHeader.split(';')[0];
    }
    expect(cookie).toBeTruthy();

    const meResponse = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body).toHaveProperty('sub');

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookie)
      .send({});

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body).toHaveProperty('accessToken');
  });

  it('/api/v1/artisans (profile creation + public slug)', async () => {
    const email = `artisan-${Date.now()}@example.com`;
    const password = '12345678';

    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password, role: 'artisan' });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body).toHaveProperty('otp');
    const registerOtp = getString(registerResponse.body, 'otp');

    const verifyResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/verify-otp')
      .send({ email, otp: registerOtp });

    expect(verifyResponse.status).toBe(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password });

    expect(loginResponse.status).toBe(200);
    const token = getString(loginResponse.body, 'accessToken');

    const profileData = {
      fullName: 'Nghệ nhân Test',
      description: 'Nghệ nhân gốm sứ',
      expertise: 'Gốm sứ Bát Tràng',
      location: 'Bắc Ninh',
      avatarUrl: 'https://example.com/avatar.png',
      cccdUrl: 'https://example.com/cccd.png',
    };

    const createProfileResponse = await request(app.getHttpServer())
      .post('/api/v1/artisans/me')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData);

    expect(createProfileResponse.status).toBe(201);
    expect(createProfileResponse.body).toHaveProperty('slug');

    const slug = getString(createProfileResponse.body, 'slug');

    const publicProfileResponse = await request(app.getHttpServer()).get(
      `/api/v1/artisans/${slug}`,
    );

    expect(publicProfileResponse.status).toBe(200);
    expect(publicProfileResponse.body).toHaveProperty(
      'fullName',
      profileData.fullName,
    );
    expect(publicProfileResponse.body).toHaveProperty('user');

    const meProfileResponse = await request(app.getHttpServer())
      .get('/api/v1/artisans/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meProfileResponse.status).toBe(200);
    expect(meProfileResponse.body).toHaveProperty('slug', slug);
  });
});
