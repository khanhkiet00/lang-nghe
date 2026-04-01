import * as dotenv from 'dotenv';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const prisma = new PrismaClient();

const categories = [
  'Gom su',
  'Det may',
  'May tre dan',
  'Do go my nghe',
  'Son mai',
  'Kim hoan',
];

async function main() {
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.order.deleteMany();
  await prisma.artisanProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  for (const name of categories) {
    const slug = slugify(name, { lower: true, strict: true, trim: true });
    await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
  }

  console.log(`Prepared e2e DB with ${categories.length} categories`);
}

main()
  .catch((error) => {
    console.error('Failed to prepare e2e DB:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
