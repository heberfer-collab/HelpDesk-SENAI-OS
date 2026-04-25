import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TicketService {
  async getAllTickets() {
    return await prisma.chamado.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createTicket(data: any) {
    return await prisma.chamado.create({
      data
    });
  }

  async updateTicket(id: number, data: any) {
    return await prisma.chamado.update({
      where: { id },
      data
    });
  }

  async getKpis() {
    const allTickets = await prisma.chamado.findMany();
    
    const total = allTickets.length;
    const abertos = allTickets.filter(t => 
      ['aberto', 'não iniciado', 'aguardando terceiros', 'em atendimento'].includes((t.status || '').toLowerCase())
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const concluidosHoje = allTickets.filter(t => 
      (t.status || '').toLowerCase().includes('concluid') && 
      t.dataSolucao && new Date(t.dataSolucao) >= today
    ).length;

    // Cálculo básico de tempo médio (em horas)
    const solvedTickets = allTickets.filter(t => t.dataSolucao && t.dataOcorrencia);
    let avgTime = 0;
    if (solvedTickets.length > 0) {
      const totalTime = solvedTickets.reduce((acc, t) => {
        const diff = new Date(t.dataSolucao!).getTime() - new Date(t.dataOcorrencia!).getTime();
        return acc + (diff / (1000 * 60 * 60));
      }, 0);
      avgTime = totalTime / solvedTickets.length;
    }

    return {
      total,
      abertos,
      concluidosHoje,
      tempoMedioResolucao: avgTime.toFixed(1) + 'h'
    };
  }

  async getAnalyticsData() {
    const allTickets = await prisma.chamado.findMany({
      select: { dataOcorrencia: true, status: true }
    });

    const now = new Date();
    
    // Agrupamento por dia da semana (últimos 7 dias)
    const weekData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      const count = allTickets.filter(t => {
        const tDate = new Date(t.dataOcorrencia);
        return tDate.toDateString() === d.toDateString();
      }).length;
      return { label: dayName, value: count };
    });

    // Agrupamento por mês (últimos 12 meses)
    const monthData = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date();
      d.setMonth(now.getMonth() - (11 - i));
      const monthName = d.toLocaleDateString('pt-BR', { month: 'short' });
      const count = allTickets.filter(t => {
        const tDate = new Date(t.dataOcorrencia);
        return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
      }).length;
      return { label: monthName, value: count };
    });

    // Agrupamento por ano (últimos 5 anos)
    const yearData = Array.from({ length: 5 }).map((_, i) => {
      const year = now.getFullYear() - (4 - i);
      const count = allTickets.filter(t => new Date(t.dataOcorrencia).getFullYear() === year).length;
      return { label: year.toString(), value: count };
    });

    // Agrupamento por Ambiente
    const ambientesData: Record<string, number> = {};
    allTickets.forEach(t => {
      const amb = t.localOcorrencia || 'Outros';
      ambientesData[amb] = (ambientesData[amb] || 0) + 1;
    });
    const environmentData = Object.entries(ambientesData).map(([label, value]) => ({ label, value }));

    return { week: weekData, month: monthData, year: yearData, environments: environmentData };
  }



  async deleteTicket(id: number) {
    return await prisma.chamado.delete({
      where: { id }
    });
  }
}

