import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create a demo user
  await prisma.user.upsert({
    where: { email: 'demo@local' },
    update: {},
    create: { email: 'demo@local', display: 'Demo User' }
  });
}

main().finally(async () => prisma.$disconnect());