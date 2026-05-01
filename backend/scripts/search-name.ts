import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEARCHING FOR "Nguyễn Minh Anh" ---');
  const userByProfile = await prisma.profile.findFirst({
    where: { display_name: { contains: 'Nguyễn Minh Anh', mode: 'insensitive' } },
    include: { user: { include: { artisanProfile: true } } }
  });
  
  if (userByProfile) {
    console.log(`Found in Profile:`);
    console.log(`  display_name: ${userByProfile.display_name}`);
    console.log(`  Artisan fullName: ${userByProfile.user?.artisanProfile?.fullName}`);
  } else {
    console.log('Not found in Profile.');
  }

  const artisanByFullName = await prisma.artisanProfile.findFirst({
    where: { fullName: { contains: 'Nguyễn Minh Anh', mode: 'insensitive' } },
    include: { user: { include: { profile: true } } }
  });

  if (artisanByFullName) {
    console.log(`Found in ArtisanProfile:`);
    console.log(`  fullName: ${artisanByFullName.fullName}`);
    console.log(`  User display_name: ${artisanByFullName.user?.profile?.display_name}`);
  } else {
    console.log('Not found in ArtisanProfile.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
