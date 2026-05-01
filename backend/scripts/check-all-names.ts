import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- START ---');
  const allProfiles = await prisma.profile.findMany({
    select: { userId: true, display_name: true }
  });
  console.log(`Found ${allProfiles.length} Profiles.`);
  allProfiles.forEach(p => {
    console.log(`P_UID: ${p.userId}, DN: ${p.display_name}`);
  });

  const allArtisans = await prisma.artisanProfile.findMany({
    select: { userId: true, fullName: true }
  });
  console.log(`Found ${allArtisans.length} Artisans.`);
  allArtisans.forEach(a => {
    console.log(`A_UID: ${a.userId}, FN: ${a.fullName}`);
  });
  console.log('--- END ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
