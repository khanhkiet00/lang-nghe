import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const artisans = await prisma.user.findMany({
    where: { roles: { some: { role: 'artisan' } } },
    select: { id: true, email: true },
  });

  for (const artisan of artisans) {
    const mineCount = await prisma.product.count({
      where: { artisanId: artisan.id, isDeleted: false }
    });
    
    const activeCount = await prisma.product.count({
      where: { artisanId: artisan.id, isActive: true, isDeleted: false }
    });

    const deletedButActive = await prisma.product.count({
      where: { artisanId: artisan.id, isActive: true, isDeleted: true }
    });

    console.log(`Artisan: ${artisan.email} (${artisan.id})`);
    console.log(`- Total (isDeleted: false): ${mineCount}`);
    console.log(`- Active (isActive: true, isDeleted: false): ${activeCount}`);
    console.log(`- Buggy (isActive: true, isDeleted: true): ${deletedButActive}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
