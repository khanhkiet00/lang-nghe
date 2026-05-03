import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Đang tạo 1 đơn hàng hoàn thành mẫu ---');

  const artisanId = 'a0000000-0000-0000-0000-000000000001'; // ID của Nghệ nhân mẫu
  const buyerId = 'b0000000-0000-0000-0000-000000000001'; // Minh Anh

  // Lấy danh sách sản phẩm của nghệ nhân
  const products = await prisma.product.findMany({
    where: { artisanId },
    take: 1,
  });

  if (products.length === 0) {
    console.log('Lỗi: Nghệ nhân không có sản phẩm nào để tạo đơn hàng.');
    return;
  }

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
      shippingAddress: { fullName: 'Nguyễn Minh Anh', phone: '0901234567', address: '123 Đường Lê Lợi', village: 'Làng gốm Bát Tràng', district: 'Gia Lâm', province: 'Hà Nội' },
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
  console.log('--- Hoàn tất ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
