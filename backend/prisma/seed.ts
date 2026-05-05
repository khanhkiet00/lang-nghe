import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old mocked data...');
  try {
    await prisma.reviewReaction.deleteMany();
    await prisma.reviewReply.deleteMany();
    await prisma.productReview.deleteMany();
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.shippingAddress.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.artisanProfile.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.otp.deleteMany();
    await prisma.user.deleteMany();
  } catch (e) {
    console.error('Cleanup logic error:', e);
  }

  const defaultPassword = 'password123';
  const hashedPassword = await hash(defaultPassword, 10);

  console.log('Seeding categories...');
  const catGomSu = await prisma.category.create({ data: { name: 'Góm Sứ', slug: 'gom-su' } });
  const catTraCu = await prisma.category.create({ data: { name: 'Trà Cụ', slug: 'tra-cu' } });
  const catTrangTri = await prisma.category.create({ data: { name: 'Trang Trí', slug: 'trang-tri' } });
  const catMayTre = await prisma.category.create({ data: { name: 'Mây Tre Đan', slug: 'may-tre-dan' } });
  const catDetMay = await prisma.category.create({ data: { name: 'Dệt & Thêu', slug: 'det-theu' } });

  console.log('Seeding main Artisan (Bát Tràng Studio)...');
  const artisanId = 'a0000000-0000-0000-0000-000000000001';
  await prisma.user.create({
    data: {
      id: artisanId,
      email: 'artisan@langnghe.com',
      password: hashedPassword,
      isEmailVerified: true,
      roles: { create: [{ role: 'buyer', isActive: true }, { role: 'artisan', isActive: true }] },
      profile: {
        create: {
          display_name: 'Bát Tràng Studio',
          slug: 'bat-trang-studio',
          village: 'Bát Tràng, Hà Nội'
        }
      },
      artisanProfile: {
        create: {
          fullName: 'Nghệ nhân Minh',
          slug: 'nghe-nhan-minh',
          expertise: 'Nghệ nhân bậc thầy',
          location: 'Bát Tràng Hub'
        }
      }
    }
  });

  console.log('Seeding Buyer Users...');
  const buyer1Id = 'b0000000-0000-0000-0000-000000000001';
  await prisma.user.create({
    data: {
      id: buyer1Id,
      email: 'minhanh@gmail.com',
      password: hashedPassword,
      isEmailVerified: true,
      roles: { create: [{ role: 'buyer', isActive: true }] },
      profile: { create: { display_name: 'Nguyễn Minh Anh', slug: 'nguyen-minh-anh', village: 'Hà Nội' } }
    }
  });

  const buyer2Id = 'b0000000-0000-0000-0000-000000000002';
  await prisma.user.create({
    data: {
      id: buyer2Id,
      email: 'quockhanh@gmail.com',
      password: hashedPassword,
      isEmailVerified: true,
      roles: { create: [{ role: 'buyer', isActive: true }] },
      profile: { create: { display_name: 'Lê Quốc Khánh', slug: 'le-quoc-khanh', village: 'Đà Nẵng' } }
    }
  });

  const buyer3Id = 'b0000000-0000-0000-0000-000000000003';
  await prisma.user.create({
    data: {
      id: buyer3Id,
      email: 'thihoa@gmail.com',
      password: hashedPassword,
      isEmailVerified: true,
      roles: { create: [{ role: 'buyer', isActive: true }] },
      profile: { create: { display_name: 'Trần Thị Hoa', slug: 'tran-thi-hoa', village: 'TP. Hồ Chí Minh' } }
    }
  });

  console.log('Seeding real products...');
  const prod1 = await prisma.product.create({
    data: {
      artisanId,
      categoryId: catGomSu.id,
      title: 'Bình gốm hoa văn cổ',
      slug: 'binh-gom-hoa-van-co-bt-001',
      price_retail: 1250000,
      price_wholesale: 950000,
      quantity: 45,
      material: 'Gốm đất nun',
      origin: 'Bát Tràng',
      processingTime: 7,
      isActive: true,
    }
  });

  const prod2 = await prisma.product.create({
    data: {
      artisanId,
      categoryId: catTraCu.id,
      title: 'Bộ ấm chén Men Lam',
      slug: 'bo-am-chen-men-lam-bt-042',
      price_retail: 3500000,
      price_wholesale: 2800000,
      quantity: 3,
      material: 'Sứ men lam',
      origin: 'Bát Tràng',
      processingTime: 14,
      isActive: true,
    }
  });

  const prod3 = await prisma.product.create({
    data: {
      artisanId,
      categoryId: catTrangTri.id,
      title: 'Đèn gốm trang trí',
      slug: 'den-gom-trang-tri-bt-118',
      price_retail: 890000,
      price_wholesale: 700000,
      quantity: 12,
      material: 'Gốm xuyên sáng',
      origin: 'Bát Tràng',
      processingTime: 5,
      isActive: true,
    }
  });

  const prod4 = await prisma.product.create({
    data: {
      artisanId,
      categoryId: catTraCu.id,
      title: 'Bình gốm mộc trà cao cấp',
      slug: 'binh-gom-moc-tra-cao-cap',
      price_retail: 1250000,
      price_wholesale: 1000000,
      quantity: 10,
      material: 'Gốm nung củi',
      origin: 'Bát Tràng',
      processingTime: 10,
      isActive: true,
    }
  });

  const prod5 = await prisma.product.create({
    data: {
      artisanId,
      categoryId: catMayTre.id,
      title: 'Bộ giỏ mây đan thủ công',
      slug: 'bo-gio-may-dan-thu-cong',
      price_retail: 420000,
      price_wholesale: 350000,
      quantity: 25,
      material: 'Mây tre tự nhiên',
      origin: 'Chương Mỹ',
      processingTime: 3,
      isActive: true,
    }
  });

  const prod6 = await prisma.product.create({
    data: {
      artisanId,
      categoryId: catDetMay.id,
      title: 'Khăn lụa tơ tằm vẽ tay',
      slug: 'khan-lua-to-tam-ve-tay',
      price_retail: 700000,
      price_wholesale: 550000,
      quantity: 15,
      material: 'Lụa tơ tằm',
      origin: 'Vạn Phúc',
      processingTime: 4,
      isActive: true,
    }
  });

  console.log('Seeding specific Orders...');
  // DH-10294
  const order1 = await prisma.order.create({
    data: {
      id: 'order-10294',
      buyerId: buyer1Id,
      artisanId,
      status: 'pending',
      paymentMethod: 'cod',
      subtotal: 1250000,
      shippingFee: 30000,
      platformFee: 62500,
      artisanAmount: 1187500,
      shippingAddress: { name: 'Nguyễn Minh Anh', phone: '0912345678', address: 'Hoàn Kiếm, Hà Nội' },
      createdAt: new Date('2023-10-14T09:45:00Z'),
    }
  });
  await prisma.orderItem.create({
    data: { orderId: order1.id, productId: prod4.id, quantity: 1, price: 1250000 }
  });

  // DH-10291
  const order2 = await prisma.order.create({
    data: {
      id: 'order-10291',
      buyerId: buyer2Id,
      artisanId,
      status: 'processing',
      paymentMethod: 'cod',
      subtotal: 840000,
      shippingFee: 30000,
      platformFee: 42000,
      artisanAmount: 798000,
      shippingAddress: { name: 'Lê Quốc Khánh', phone: '0988776655', address: 'Hải Châu, Đà Nẵng' },
      createdAt: new Date('2023-10-13T15:20:00Z'),
    }
  });
  await prisma.orderItem.create({
    data: { orderId: order2.id, productId: prod5.id, quantity: 2, price: 420000 }
  });

  // DH-10285
  const order3 = await prisma.order.create({
    data: {
      id: 'order-10285',
      buyerId: buyer3Id,
      artisanId,
      status: 'shipped',
      paymentMethod: 'bank_transfer',
      paymentStatus: 'paid',
      subtotal: 2100000,
      shippingFee: 0,
      platformFee: 105000,
      artisanAmount: 1995000,
      shippingAddress: { name: 'Trần Thị Hoa', phone: '0901234567', address: 'Quận 1, TP. Hồ Chí Minh' },
      createdAt: new Date('2023-10-12T11:12:00Z'),
    }
  });
  await prisma.orderItem.create({
    data: { orderId: order3.id, productId: prod6.id, quantity: 3, price: 700000 }
  });

  console.log('Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
