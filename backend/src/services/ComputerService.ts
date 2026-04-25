import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ComputerService {
  async getAllComputers() {
    return await prisma.computador.findMany({
      orderBy: { nome: 'asc' }
    });
  }

  async createComputer(data: any) {
    return await prisma.computador.create({
      data: {
        nome: data.nome,
        patrimonio: data.patrimonio,
        numeroSerie: data.numeroSerie,
        macAddress: data.macAddress,
        ip: data.ip,
        ambiente: data.ambiente,
        responsavelSetor: data.responsavelSetor
      }
    });
  }

  async updateHeartbeat(mac: string, ip?: string) {
    return await prisma.computador.update({
      where: { macAddress: mac },
      data: { 
        lastSeen: new Date(),
        ip: ip // Atualiza o IP se for fornecido
      }
    });
  }

  async deleteComputer(id: number) {
    return await prisma.computador.delete({
      where: { id }
    });
  }

  async updateComputer(id: number, data: any) {
    return await prisma.computador.update({
      where: { id },
      data
    });
  }
}
