import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const artisans = await prisma.artisanProfile.findMany({
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  artisans.forEach((a) => {
    console.log(`Artisan UID: ${a.userId}`);
    console.log(`  FullName: "${a.fullName}"`);
    console.log(`  User Email: "${a.user?.email}"`);
    console.log(`  Profile.display_name: "${a.user?.profile?.display_name}"`);
    console.log(`  Location: "${a.location}"`);
    console.log('---');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
