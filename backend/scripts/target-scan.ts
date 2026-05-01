import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SCANNING ARTISAN PROFILE BY LOCATION "Bát Tràng Hub" ---');
  
  const artisans = await prisma.artisanProfile.findMany({
    where: { location: { contains: 'Bát Tràng Hub', mode: 'insensitive' } },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (artisans.length === 0) {
    console.log('No artisan found at "Bát Tràng Hub".');
    return;
  }

  artisans.forEach((a) => {
    console.log(`[Artisan UID: ${a.userId}]`);
    console.log(`  FullName: "${a.fullName}"`);
    console.log(`  Location: "${a.location}"`);
    console.log(`  Email: "${a.user?.email}"`);
    console.log(`  Profile Display Name (DN): "${a.user?.profile?.display_name}"`);
    console.log(`  Profile Village: "${a.user?.profile?.village}"`);
    console.log('---');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
