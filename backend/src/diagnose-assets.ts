import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function diagnose() {
  console.log('--- Iniciando Diagnóstico de Ativos ---');

  try {
    // 1. Verificar Ambientes
    const amb = await prisma.ambiente.findMany();
    console.log('1. Ambientes disponíveis:', amb.length > 0 ? 'SIM (' + amb.length + ')' : 'NÃO (Vazio!)');

    // 2. Verificar Responsáveis
    const resp = await prisma.responsavelSetor.findMany();
    console.log('2. Responsáveis disponíveis:', resp.length > 0 ? 'SIM (' + resp.length + ')' : 'NÃO (Vazio!)');

    // 3. Testar Inserção com dados reais
    const testMac = 'FF-EE-DD-CC-BB-AA';
    await prisma.computador.deleteMany({ where: { macAddress: testMac } });
    
    if (amb.length > 0 && resp.length > 0) {
      const comp = await prisma.computador.create({
        data: {
          nome: 'TESTE-FINAL-SISTEMA',
          macAddress: testMac,
          ambiente: amb[0].nome,
          responsavelSetor: resp[0].nome,
          patrimonio: 'TESTE-999'
        }
      });
      console.log('3. Cadastro de teste realizado com sucesso:', comp.nome);
      
      // 4. Testar Heartbeat
      const pulse = await prisma.computador.update({
        where: { macAddress: testMac },
        data: { lastSeen: new Date(), ip: '10.0.0.50' }
      });
      console.log('4. Heartbeat processado para:', pulse.nome);
    } else {
      console.log('3. Pulei o teste de cadastro porque faltam Ambientes ou Responsáveis no sistema.');
    }

    console.log('--- Diagnóstico Concluído ---');
  } catch (err: any) {
    console.error('ERRO NO DIAGNÓSTICO:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
