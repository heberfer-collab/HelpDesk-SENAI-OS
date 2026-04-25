import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LogService {
  async createLog(userId: number | null, acao: string, detalhes?: string) {
    return await prisma.log.create({
      data: {
        userId,
        acao,
        detalhes
      }
    });
  }

  async getAllLogs() {
    return await prisma.log.findMany({
      include: {
        user: {
          select: { nome: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
