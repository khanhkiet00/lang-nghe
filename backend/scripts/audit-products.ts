import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      artisanId: true,
      isActive: true,
      isDeleted: true,
      artisan: { select: { email: true } }
    }
  });

  console.log('--- ALL PRODUCTS ---');
  products.forEach(p => {
    console.log(`[${p.id}] ${p.title.padEnd(20)} | Artisan: ${p.artisan.email} | Active: ${p.isActive} | Deleted: ${p.isDeleted}`);
  });
  console.log('--- END ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
