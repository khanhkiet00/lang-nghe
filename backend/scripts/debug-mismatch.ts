import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = '9733be6b-5af7-475d-9eb1-af796e7ba524'; // khanhkiet1001
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
        _count: {
            select: { products: true }
        },
        products: true
    }
  });

  console.log('User ID:', userId);
  console.log('Stats Products Count:', user?._count?.products);
  console.log('Actual Products Array Length:', user?.products?.length);
  console.log('Products:', JSON.stringify(user?.products, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
