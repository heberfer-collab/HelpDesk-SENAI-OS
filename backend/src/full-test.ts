import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const testMac = 'AA-BB-CC-00-11-22';
  
  console.log('--- Iniciando Teste ---');

  try {
    // 1. Limpa se já existir
    await prisma.computador.deleteMany({ where: { macAddress: testMac } });

    // 2. Cadastra novo
    const newComp = await prisma.computador.create({
      data: {
        nome: 'PC-TESTE-ANTIGRAVITY',
        macAddress: testMac,
        ambiente: 'Laboratório Teste',
        responsavelSetor: 'Sistema'
      }
    });
    console.log('1. Cadastro realizado:', newComp.nome);

    // 3. Simula Heartbeat
    const updated = await prisma.computador.update({
      where: { macAddress: testMac },
      data: { 
        lastSeen: new Date(),
        ip: '192.168.1.100'
      }
    });
    console.log('2. Heartbeat enviado. Última vez visto:', updated.lastSeen.toLocaleTimeString());

    console.log('--- Teste Concluído com Sucesso ---');
  } catch (err: any) {
    console.error('Falha no teste:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
