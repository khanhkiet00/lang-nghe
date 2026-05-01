import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const query = 'Minh';
  console.log(`Searching for "${query}"...`);
  
  const profiles = await prisma.profile.findMany({
    where: { display_name: { contains: query, mode: 'insensitive' } }
  });
  
  const artisans = await prisma.artisanProfile.findMany({
    where: { fullName: { contains: query, mode: 'insensitive' } }
  });

  console.log('--- Found in Profile ---');
  profiles.forEach(p => console.log(`ID: ${p.userId}, Name: ${p.display_name}`));
  
  console.log('--- Found in ArtisanProfile ---');
  artisans.forEach(a => console.log(`ID: ${a.userId}, Name: ${a.fullName}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
