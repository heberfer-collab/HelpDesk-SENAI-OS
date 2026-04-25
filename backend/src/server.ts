import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { TicketService } from './services/TicketService';
import { UserService } from './services/UserService';
import { LogService } from './services/LogService';
import { ComputerService } from './services/ComputerService';
import { authMiddleware, adminMiddleware, techMiddleware } from './middlewares/auth';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Services
const ticketService = new TicketService();
const userService = new UserService();
const logService = new LogService();
const computerService = new ComputerService();

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const user = await userService.register(req.body);
    await logService.createLog(user.id, 'Registro de Usuário', `Usuário ${user.nome} registrado.`);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const result = await userService.login(req.body.email, req.body.password);
    await logService.createLog(result.user.id, 'Login', `Usuário ${result.user.nome} logou no sistema.`);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

app.get('/api/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', authMiddleware, async (req: any, res) => {
  try {
    // Only Admin can change role or edit others
    if (req.user.role !== 'ADMIN' && req.user.userId !== Number(req.params.id)) {
      return res.status(403).json({ error: 'Não autorizado' });
    }
    
    // Non-admins cannot change their own role
    if (req.user.role !== 'ADMIN') {
      delete req.body.role;
    }

    const user = await userService.updateUser(Number(req.params.id), req.body);
    await logService.createLog(req.user.userId, 'Edição de Usuário', `Dados do usuário ${user.nome} atualizados.`);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', authMiddleware, adminMiddleware, async (req: any, res) => {
  try {
    const deletedUser = await userService.deleteUser(Number(req.params.id));
    await logService.createLog(req.user.userId, 'Exclusão de Usuário', `Usuário ${deletedUser.nome} (${deletedUser.email}) removido.`);
    res.json({ success: true });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// --- Protected Routes ---
app.get('/api/chamados', async (req, res) => {
  try {
    const chamados = await ticketService.getAllTickets();
    res.json(chamados);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar chamados' });
  }
});

app.post('/api/chamados', async (req, res) => {
  try {
    const chamado = await ticketService.createTicket(req.body);
    // Log non-authenticated creation if necessary or use authMiddleware
    res.json(chamado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar chamado' });
  }
});

app.patch('/api/chamados/:id', authMiddleware, techMiddleware, async (req: any, res) => {
  try {
    const chamado = await ticketService.updateTicket(Number(req.params.id), req.body);
    await logService.createLog(req.user.userId, 'Atualização de Chamado', `Chamado #${chamado.id} atualizado para status: ${chamado.status}`);
    res.json(chamado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar chamado' });
  }
});

app.delete('/api/chamados/:id', authMiddleware, adminMiddleware, async (req: any, res) => {
  try {
    const deletedTicket = await ticketService.deleteTicket(Number(req.params.id));
    await logService.createLog(req.user.userId, 'Exclusão de Chamado', `Chamado #${deletedTicket.id} (${deletedTicket.descricaoProblema}) removido pelo administrador.`);
    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir chamado' });
  }
});


// --- Logs ---
app.get('/api/logs', authMiddleware, async (req, res) => {
  try {
    const logs = await logService.getAllLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
});

// --- Config Entities (simplified for brevity, could use ConfigService) ---
const createConfigRoutes = (path: string, model: any) => {
  app.get(`/api/${path}`, async (req, res) => {
    try {
      const items = await (prisma as any)[model].findMany({ 
        orderBy: [
          { ordem: 'asc' },
          { nome: 'asc' }
        ] 
      });
      res.json(items);
    } catch (error) {
      console.error(`Erro detalhado ao buscar ${path}:`, error);
      res.status(500).json({ error: `Erro ao buscar ${path}` });
    }
  });

  app.post(`/api/${path}`, authMiddleware, adminMiddleware, async (req: any, res) => {
    try {
      const item = await (prisma as any)[model].create({ data: req.body });
      await logService.createLog(req.user.userId, `Criação em ${path}`, `Adicionado: ${item.nome}`);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: `Erro ao criar ${path}` });
    }
  });

  app.put(`/api/${path}/:id`, authMiddleware, adminMiddleware, async (req: any, res) => {
    try {
      const item = await (prisma as any)[model].update({
        where: { id: Number(req.params.id) },
        data: req.body
      });
      await logService.createLog(req.user.userId, `Atualização em ${path}`, `Alterado para: ${item.nome}`);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: `Erro ao atualizar ${path}` });
    }
  });

  app.post(`/api/reorder/${path}`, authMiddleware, adminMiddleware, async (req: any, res) => {
    try {
      const { items } = req.body; // Expecting [{id: 1, ordem: 0}, {id: 2, ordem: 1}]
      const updates = items.map((item: any) => 
        (prisma as any)[model].update({
          where: { id: item.id },
          data: { ordem: item.ordem }
        })
      );
      await Promise.all(updates);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: `Erro ao reordenar ${path}` });
    }
  });

  app.delete(`/api/${path}/:id`, authMiddleware, adminMiddleware, async (req: any, res) => {


    try {
      const item = await (prisma as any)[model].delete({ where: { id: Number(req.params.id) } });
      await logService.createLog(req.user.userId, `Exclusão em ${path}`, `Removido item: ${item.nome || item.id}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: `Erro ao excluir ${path}` });
    }
  });


};

createConfigRoutes('ambientes', 'ambiente');
createConfigRoutes('status', 'status');
createConfigRoutes('tipos-servico', 'tipoServico');
createConfigRoutes('responsaveis-setor', 'responsavelSetor');
createConfigRoutes('tecnicos', 'tecnico');

app.get('/api/analytics/charts', async (req, res) => {
  try {
    const data = await ticketService.getAnalyticsData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados dos gráficos' });
  }
});

app.get('/api/analytics/kpis', async (req, res) => {

  try {
    const kpis = await ticketService.getKpis();
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ error: 'Erro no analytics' });
  }
});

// --- Computer Routes ---
app.get('/api/computadores', authMiddleware, async (req, res) => {
  try {
    const computers = await computerService.getAllComputers();
    res.json(computers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar computadores' });
  }
});

app.post('/api/computadores', authMiddleware, async (req, res) => {
  try {
    const computer = await computerService.createComputer(req.body);
    await logService.createLog((req as any).user.userId, 'Cadastro de Computador', `Computador ${computer.nome} cadastrado.`);
    res.json(computer);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar computador' });
  }
});

app.post('/api/computadores/heartbeat', async (req, res) => {
  try {
    const { mac, ip } = req.body;
    const computer = await computerService.updateHeartbeat(mac, ip);
    res.json(computer);
  } catch (error) {
    res.status(404).json({ error: 'Computador não encontrado' });
  }
});

app.delete('/api/computadores/:id', authMiddleware, adminMiddleware, async (req: any, res) => {
  try {
    await computerService.deleteComputer(Number(req.params.id));
    await logService.createLog(req.user.userId, 'Exclusão de Computador', `Computador ID ${req.params.id} removido.`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir computador' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
