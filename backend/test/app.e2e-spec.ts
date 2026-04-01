import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
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

function getArray(body: unknown, key: string): unknown[] {
  const record = asRecord(body);
  const value = record[key];
  if (!Array.isArray(value)) {
    throw new Error(`Expected array field: ${key}`);
  }
  return value;
}

async function registerVerifyAndLogin(
  prisma: PrismaService,
  jwtService: JwtService,
  email: string,
  rawPassword: string,
) {
  const password = await bcrypt.hash(rawPassword, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password,
      isEmailVerified: true,
      roles: {
        create: [{ role: 'buyer' }, { role: 'artisan' }],
      },
    },
  });

  const token = jwtService.sign({
    sub: user.id,
    email: user.email,
    roles: ['buyer', 'artisan'],
  });

  return {
    token,
    userId: user.id,
  };
}

describe('API flows (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = new JwtService({
      secret: process.env.JWT_SECRET || 'change_this_secret',
    });
    await app.init();
  }, 20000);

  afterEach(async () => {
    await prisma.review.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.order.deleteMany();
    await prisma.artisanProfile.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.otp.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('GET /api/v1 returns hello world', async () => {
    await request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect('Hello World!');
  });

  it('users profile update and me details flow', async () => {
    const auth = await registerVerifyAndLogin(
      prisma,
      jwtService,
      `user-${Date.now()}@example.com`,
      '12345678',
    );

    const updateProfileResponse = await request(app.getHttpServer())
      .patch('/api/v1/users/profile')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        display_name: 'user profile test',
        bio: 'bio test',
        village: 'bat trang',
        avatar_url: 'https://example.com/avatar.png',
      });

    expect(updateProfileResponse.status).toBe(200);
    expect(updateProfileResponse.body).toHaveProperty('data.slug');

    const meResponse = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${auth.token}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body).toHaveProperty('data.profile.display_name');
    expect(meResponse.body).toHaveProperty('data.products');
  });

  it('products create, list and optimistic locking update', async () => {
    const auth = await registerVerifyAndLogin(
      prisma,
      jwtService,
      `seller-${Date.now()}@example.com`,
      '12345678',
    );

    const createProductResponse = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        title: 'Am tra gom su',
        description: 'San pham gom thu cong',
        category_slug: 'gom-su',
        price_retail: 250000,
        price_wholesale: 200000,
        quantity: 40,
        images: ['https://example.com/p1.png'],
      });

    expect(createProductResponse.status).toBe(201);
    const product = asRecord(asRecord(createProductResponse.body).data);
    const productId = getString(product, 'id');
    expect(product.version).toBe(0);

    const listResponse = await request(app.getHttpServer())
      .get('/api/v1/products')
      .query({ category_slug: 'gom-su', search: 'am tra' });

    expect(listResponse.status).toBe(200);
    const listData = asRecord(asRecord(listResponse.body).data);
    const items = getArray(listData, 'items');
    expect(items.length).toBe(1);

    const updateResponse = await request(app.getHttpServer())
      .patch(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ version: 0, quantity: 30 });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toHaveProperty('data.version', 1);

    const staleUpdateResponse = await request(app.getHttpServer())
      .patch(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ version: 0, quantity: 20 });

    expect(staleUpdateResponse.status).toBe(409);
  });

  it('products reject update from non-owner', async () => {
    const ownerAuth = await registerVerifyAndLogin(
      prisma,
      jwtService,
      `owner-${Date.now()}@example.com`,
      '12345678',
    );
    const otherAuth = await registerVerifyAndLogin(
      prisma,
      jwtService,
      `other-${Date.now()}@example.com`,
      '12345678',
    );

    const createProductResponse = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${ownerAuth.token}`)
      .send({
        title: 'Binh gom',
        description: 'Do thu cong',
        category_slug: 'gom-su',
        price_retail: 100000,
        price_wholesale: 80000,
        quantity: 10,
      });

    expect(createProductResponse.status).toBe(201);
    const product = asRecord(asRecord(createProductResponse.body).data);
    const productId = getString(product, 'id');

    const updateByOtherResponse = await request(app.getHttpServer())
      .patch(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${otherAuth.token}`)
      .send({
        version: 0,
        quantity: 1,
      });

    expect(updateByOtherResponse.status).toBe(403);
  });

  it('reviews create and list by reviewee', async () => {
    const artisanAuth = await registerVerifyAndLogin(
      prisma,
      jwtService,
      `artisan-${Date.now()}@example.com`,
      '12345678',
    );
    const buyerAuth = await registerVerifyAndLogin(
      prisma,
      jwtService,
      `buyer-${Date.now()}@example.com`,
      '12345678',
    );

    const order = await prisma.order.create({
      data: {
        buyerId: buyerAuth.userId,
        artisanId: artisanAuth.userId,
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        subtotal: 500000,
        shippingFee: 20000,
        platformFee: 10000,
        artisanAmount: 490000,
      },
    });

    const createReviewResponse = await request(app.getHttpServer())
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${buyerAuth.token}`)
      .send({
        reviewee_id: artisanAuth.userId,
        order_id: order.id,
        rating_quality: 5,
        rating_accuracy: 5,
        rating_shipping: 4,
        rating_communication: 5,
        rating_payment: 5,
        comment: 'good quality',
        images: ['https://example.com/review-1.png'],
      });

    expect(createReviewResponse.status).toBe(201);
    expect(createReviewResponse.body).toHaveProperty('data.id');

    const listReviewResponse = await request(app.getHttpServer()).get(
      `/api/v1/users/${artisanAuth.userId}/reviews`,
    );

    expect(listReviewResponse.status).toBe(200);
    const reviews = asRecord(listReviewResponse.body).data;
    expect(Array.isArray(reviews)).toBe(true);
    expect((reviews as unknown[]).length).toBe(1);
  });

  it('reviews reject non-completed order', async () => {
    const artisanAuth = await registerVerifyAndLogin(
      prisma,
      jwtService,
      `artisan-pending-${Date.now()}@example.com`,
      '12345678',
    );
    const buyerAuth = await registerVerifyAndLogin(
      prisma,
      jwtService,
      `buyer-pending-${Date.now()}@example.com`,
      '12345678',
    );

    const order = await prisma.order.create({
      data: {
        buyerId: buyerAuth.userId,
        artisanId: artisanAuth.userId,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        subtotal: 100000,
        shippingFee: 10000,
        platformFee: 5000,
        artisanAmount: 95000,
      },
    });

    const createReviewResponse = await request(app.getHttpServer())
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${buyerAuth.token}`)
      .send({
        reviewee_id: artisanAuth.userId,
        order_id: order.id,
        rating_quality: 4,
        rating_accuracy: 4,
        rating_shipping: 4,
        rating_communication: 4,
        rating_payment: 4,
      });

    expect(createReviewResponse.status).toBe(400);
  });
});
