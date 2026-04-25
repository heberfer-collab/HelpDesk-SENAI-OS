import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const computer = await prisma.computador.create({
      data: {
        nome: 'CADCAMC21341839',
        macAddress: 'D0-94-66-EA-14-B1',
        ambiente: 'Teste',
        responsavelSetor: 'Teste'
      }
    });
    console.log('Sucesso ao cadastrar:', computer);
  } catch (error: any) {
    console.error('Erro detalhado no banco de dados:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
