import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Đang tạo dữ liệu đơn hàng mẫu ---');

  const artisanId = 'a0000000-0000-0000-0000-000000000001'; // ID của Nghệ nhân mẫu
  const buyers = [
    'b0000000-0000-0000-0000-000000000001', // Minh Anh
    'b0000000-0000-0000-0000-000000000002', // Quốc Khánh
    'b0000000-0000-0000-0000-000000000003', // Thị Hoa
  ];

  // Lấy danh sách sản phẩm của nghệ nhân
  const products = await prisma.product.findMany({
    where: { artisanId },
    take: 5,
  });

  if (products.length === 0) {
    console.log('Lỗi: Nghệ nhân không có sản phẩm nào để tạo đơn hàng.');
    return;
  }

  const sampleOrders = [
    {
      buyerId: buyers[0],
      note: 'Gói quà giúp mình nhé, mình tặng sinh nhật bạn.',
      address: { fullName: 'Nguyễn Minh Anh', phone: '0901234567', address: '123 Đường Lê Lợi', village: 'Làng gốm Bát Tràng', district: 'Gia Lâm', city: 'Hà Nội' }
    },
    {
      buyerId: buyers[1],
      note: 'Giao hàng vào giờ hành chính.',
      address: { fullName: 'Trần Quốc Khánh', phone: '0912345678', address: '456 Phố Huế', village: 'Làng lụa Vạn Phúc', district: 'Hà Đông', city: 'Hà Nội' }
    },
    {
      buyerId: buyers[2],
      note: 'Cẩn thận hàng dễ vỡ ạ.',
      address: { fullName: 'Lê Thị Hoa', phone: '0987654321', address: '789 Trần Hưng Đạo', village: 'Làng đúc đồng Đại Bái', district: 'Gia Bình', city: 'Bắc Ninh' }
    },
    {
      buyerId: buyers[0],
      note: '',
      address: { fullName: 'Nguyễn Minh Anh', phone: '0901234567', address: '123 Đường Lê Lợi', village: 'Làng gốm Bát Tràng', district: 'Gia Lâm', city: 'Hà Nội' }
    },
    {
        buyerId: buyers[1],
        note: 'Gửi kèm thiệp chúc mừng.',
        address: { fullName: 'Trần Quốc Khánh', phone: '0912345678', address: '456 Phố Huế', village: 'Làng lụa Vạn Phúc', district: 'Hà Đông', city: 'Hà Nội' }
      }
  ];

  for (const data of sampleOrders) {
    // Chọn ngẫu nhiên 1-2 sản phẩm
    const numItems = Math.floor(Math.random() * 2) + 1;
    const selectedProducts = products.sort(() => 0.5 - Math.random()).slice(0, numItems);

    const subtotal = selectedProducts.reduce((acc, p) => acc + p.price_retail, 0);

    const order = await prisma.order.create({
      data: {
        artisanId,
        buyerId: data.buyerId,
        status: 'pending',
        subtotal,
        shippingAddress: data.address,
        noteFromBuyer: data.note,
        orderItems: {
          create: selectedProducts.map(p => ({
            productId: p.id,
            quantity: 1,
            price: p.price_retail
          }))
        }
      }
    });

    console.log(`Đã tạo đơn hàng: #${order.id.slice(-6)} - Khách: ${data.address.fullName}`);
  }

  console.log('--- Hoàn tất tạo dữ liệu mẫu ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
