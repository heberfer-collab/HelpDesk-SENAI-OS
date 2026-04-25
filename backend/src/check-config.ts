import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const amb = await prisma.ambiente.findMany();
  const resp = await prisma.responsavelSetor.findMany();
  console.log('Ambientes:', amb.length);
  console.log('Responsaveis:', resp.length);
}

main().finally(() => prisma.$disconnect());
