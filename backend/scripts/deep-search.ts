import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const query = 'Anh';
  console.log(`Searching for "${query}" in ALL users...`);

  const users = await prisma.user.findMany({
    include: { profile: true, artisanProfile: true }
  });

  let found = false;
  users.forEach(u => {
    const names = [
      u.email,
      u.profile?.display_name,
      u.artisanProfile?.fullName,
      u.profile?.village,
      u.artisanProfile?.location
    ].filter(Boolean);

    if (names.some(n => n?.includes('Anh') || n?.includes('Minh'))) {
      console.log(`[MATCH FOUND] User ID: ${u.id}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Profile Name: ${u.profile?.display_name}`);
      console.log(`  Artisan Name: ${u.artisanProfile?.fullName}`);
      found = true;
    }
  });

  if (!found) {
    console.log('No direct matches for "Anh" or "Minh" in any profile fields.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
