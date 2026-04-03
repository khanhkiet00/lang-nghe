// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

const categoriesList = [
  'Gom su', 'Det may', 'May tre dan', 'Do go my nghe', 'Son mai', 'Kim hoan'
];

// Helper to get random item from array
const randItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
// Helper to get random number in range
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

async function main() {
  console.log('Clearing old mocked data...');
  // Delete in proper order to respect relations
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.artisanProfile.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding categories...');
  const categories = [];
  for (const name of categoriesList) {
    const slug = slugify(name, { lower: true, strict: true, trim: true });
    categories.push(await prisma.category.create({ data: { name, slug } }));
  }

  const defaultPassword = 'password123';
  const hashedPassword = await hash(defaultPassword, 10);

  console.log('Seeding fake users...');
  // MOCK BUYER
  const buyerId = 'b0000000-0000-0000-0000-000000000001';
  await prisma.user.create({
    data: {
      id: buyerId,
      email: 'buyer@langnghe.com',
      password: hashedPassword,
      isEmailVerified: true,
      roles: { create: { role: 'buyer' } },
      profile: {
        create: {
          display_name: 'Khách hàng Demo',
          slug: 'khach-hang-demo'
        }
      }
    }
  });

  // MOCK ARTISAN
  const artisanId = 'a0000000-0000-0000-0000-000000000001';
  await prisma.user.create({
    data: {
      id: artisanId,
      email: 'artisan@langnghe.com',
      password: hashedPassword,
      isEmailVerified: true,
      roles: { create: [{ role: 'buyer' }, { role: 'artisan' }] },
      profile: {
        create: {
          display_name: 'Nghệ nhân Demo',
          slug: 'nghe-nhan-demo'
        }
      },
      artisanProfile: {
        create: {
          fullName: 'Xưởng Gốm Bát Tràng',
          slug: 'xuong-gom-bat-trang',
          expertise: 'Gốm Sứ Truyền Thống',
          location: 'Bát Tràng, Hà Nội'
        }
      }
    }
  });

  console.log('Seeding products...');
  const products = [];
  for (let i = 1; i <= 20; i++) {
    const cat = randItem(categories);
    const price = randInt(1, 20) * 50000; // 50k to 1M
    products.push(await prisma.product.create({
      data: {
        title: `Sản phẩm ${cat.name} ${i}`,
        slug: slugify(`Sản phẩm ${cat.name} ${i}-${Date.now()}`, { lower: true, strict: true }),
        categoryId: cat.id,
        artisanId: artisanId,
        price_retail: price,
        price_wholesale: price * 0.8,
        quantity: randInt(10, 100),
      }
    }));
  }

  console.log('Seeding orders...');
  const statuses = ['pending', 'delivering', 'completed', 'cancelled'];
  const cancelReasons = [
    'Hết hàng', 
    'Khách hủy đơn', 
    'Giao hàng thất bại', 
    'Hư hỏng trong quá trình vận chuyển'
  ];

  // We want to generate orders starting from 2023-01-01 to 2024-12-31
  const startDate = new Date('2023-01-01').getTime();
  const endDate = new Date('2025-01-01').getTime();

  for (let i = 0; i < 150; i++) {
    const status = i < 120 ? 'completed' : randItem(statuses); // 80% completed
    const orderDate = new Date(startDate + Math.random() * (endDate - startDate));
    const cancelReason = status === 'cancelled' ? randItem(cancelReasons) : null;
    
    // Pick 1-3 random products
    const orderItemsData = [];
    const numItems = randInt(1, 3);
    let subtotal = 0;
    
    for (let j = 0; j < numItems; j++) {
      const prod = randItem(products);
      const qty = randInt(1, 5);
      subtotal += prod.price_retail * qty;
      orderItemsData.push({
        productId: prod.id,
        quantity: qty,
        price: prod.price_retail,
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }

    await prisma.order.create({
      data: {
        buyerId,
        artisanId,
        status,
        cancelReason,
        paymentStatus: status === 'completed' ? 'paid' : 'pending',
        subtotal,
        shippingFee: 30000,
        platformFee: subtotal * 0.05,
        artisanAmount: subtotal * 0.95,
        createdAt: orderDate,
        updatedAt: orderDate,
        orderItems: {
          create: orderItemsData
        }
      }
    });
  }

  console.log('✅ Seeding completely finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
