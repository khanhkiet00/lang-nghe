import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS unaccent`;
    console.log('unaccent extension is active.');
    
    const result = await prisma.$queryRaw`SELECT unaccent('máy tính') as result`;
    console.log('Test unaccent:', result);
  } catch (err) {
    console.error('unaccent extension is NOT available or failed:', err);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
