import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const computers = await prisma.computador.findMany();
  console.log(JSON.stringify(computers, null, 2));
}

main().finally(() => prisma.$disconnect());
