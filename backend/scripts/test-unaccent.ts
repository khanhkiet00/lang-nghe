import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`SELECT unaccent('Tiếng Việt') as test`;
    console.log('Unaccent test result:', result);
  } catch (error) {
    console.error('Unaccent extension is likely NOT enabled:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
