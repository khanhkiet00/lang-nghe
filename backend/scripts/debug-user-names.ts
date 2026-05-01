import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      profile: true,
      artisanProfile: true,
    },
    take: 10
  });
  
  console.log('--- DATABASE CHECK ---');
  users.forEach(u => {
    console.log(`User ID: ${u.id}, Email: ${u.email}`);
    console.log(`  Profile Display Name: ${u.profile?.display_name}`);
    console.log(`  Artisan Full Name: ${u.artisanProfile?.fullName}`);
    console.log('----------------------');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
