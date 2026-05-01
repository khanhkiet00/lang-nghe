import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = 'a0000000-0000-0000-0000-000000000001'; // artisan@langnghe.com
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      reputationScore: true,
      _count: {
        select: {
          followers: true,
          following: true,
          products: true,
        },
      },
      products: {
        where: { isActive: true },
        select: { id: true },
      },
    },
  });

  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
