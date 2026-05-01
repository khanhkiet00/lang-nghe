import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const followerId = '9733be6b-5af7-475d-9eb1-af796e7ba524'; // khanhkiet1001
  const followingId = 'a0000000-0000-0000-0000-000000000001'; // artisan

  await prisma.user.update({
    where: { id: followerId },
    data: {
      following: {
        connect: { id: followingId },
      },
    },
  });

  console.log('Followed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
