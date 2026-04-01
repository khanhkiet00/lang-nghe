import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

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
  for (const name of categories) {
    const slug = slugify(name, { lower: true, strict: true, trim: true });
    await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
  }

  console.log(`Seeded ${categories.length} categories`);
}

main()
  .catch((error) => {
    console.error('Category seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
