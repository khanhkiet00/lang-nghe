import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { select: { email: true } },
      artisan: { select: { email: true, artisanProfile: { select: { fullName: true } } } },
    },
  });

  if (!order) {
    console.log('Order not found');
    return;
  }

  console.log('Order Details:');
  console.log('ID:', order.id);
  console.log('Status:', order.status);
  console.log('Buyer ID:', order.buyerId, `(${order.buyer.email})`);
  console.log('Artisan ID:', order.artisanId, `(${order.artisan.email} - ${order.artisan.artisanProfile?.fullName})`);
  
  // Also check all users with artisan role
  const artisans = await prisma.user.findMany({
    where: { roles: { some: { role: 'artisan' } } },
    select: { id: true, email: true }
  });
  console.log('\nArtisans in system:');
  artisans.forEach(a => console.log(`- ${a.email}: ${a.id}`));
}

const orderId = '80096c1f-eac9-46ce-84f8-bfb5a2e5f767';
checkOrder(orderId).finally(() => prisma.$disconnect());
