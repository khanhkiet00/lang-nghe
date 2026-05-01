import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const searchStr = 'Anh';
  console.log(`Searching for "${searchStr}"...`);

  const users = await prisma.user.findMany({
    include: { profile: true, artisanProfile: true }
  });

  console.log('--- ALL RECORDS ---');
  users.forEach(u => {
    console.log(`[User ${u.id}]`);
    console.log(`  Email: ${u.email}`);
    console.log(`  Phone: ${u.phone}`);
    console.log(`  Profile.display_name: "${u.profile?.display_name}"`);
    console.log(`  Artisan.fullName: "${u.artisanProfile?.fullName}"`);
    console.log('---');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
