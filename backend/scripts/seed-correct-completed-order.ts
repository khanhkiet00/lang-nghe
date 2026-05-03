import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Tìm buyerId từ đơn hàng gần nhất ---');

  // Tìm đơn hàng có ID bắt đầu bằng bd99f19f
  const orderRef = await prisma.order.findFirst({
    where: {
      id: {
        startsWith: 'bd99f19f',
      }
    },
    include: {
      buyer: true
    }
  });

  if (!orderRef) {
    console.log('Không tìm thấy đơn hàng bd99f19f. Lấy order mới nhất.');
    const latest = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    if (!latest) return;
    return await seedForBuyer(latest.buyerId, latest.artisanId);
  }

  console.log(`Tìm thấy buyerId: ${orderRef.buyerId}`);
  await seedForBuyer(orderRef.buyerId, orderRef.artisanId);
}

async function seedForBuyer(buyerId: string, artisanId: string) {
  const products = await prisma.product.findMany({
    where: { artisanId },
    take: 1,
  });

  if (products.length === 0) return;

  const p = products[0];

  const order = await prisma.order.create({
    data: {
      artisanId,
      buyerId,
      status: 'completed',
      subtotal: p.price_retail,
      shippingFee: 30000,
      platformFee: Math.round(p.price_retail * 0.05),
      artisanAmount: p.price_retail - Math.round(p.price_retail * 0.05),
      shippingAddress: { fullName: 'User', phone: '0901234567', address: '123 Đường', village: 'Làng', district: 'Huyện', province: 'Tỉnh' },
      noteFromBuyer: 'Đơn hàng test trạng thái completed',
      paymentMethod: 'cod',
      paymentStatus: 'paid',
      deliveredAt: new Date(),
      completedAt: new Date(),
      orderItems: {
        create: [{
          productId: p.id,
          quantity: 1,
          price: p.price_retail
        }]
      }
    }
  });
  console.log(`Đã tạo đơn hàng hoàn thành: #${order.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
