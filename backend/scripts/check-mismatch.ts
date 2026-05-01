import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const stats = await prisma.product.groupBy({
    by: ['isActive', 'isDeleted'],
    _count: true,
  });
  console.log('Product Stats:', JSON.stringify(stats, null, 2));

  const nullIsDeletedCount = await prisma.product.count({
    where: {
      isDeleted: { equals: undefined } as any, // Try to find nulls
    },
  });
  console.log('NULL isDeleted count (approx):', nullIsDeletedCount);
  
  // Real check for nulls via queryRaw
  const nullCheck = await prisma.$queryRaw`SELECT COUNT(*) FROM "Product" WHERE "isDeleted" IS NULL`;
  console.log('Actual NULL isDeleted count:', nullCheck);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
