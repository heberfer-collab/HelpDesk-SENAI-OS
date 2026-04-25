import React, { useState, useEffect } from 'react';
import { MoreVertical, User, Calendar, Tag, X, Save, CheckCircle2, AlertTriangle, Settings, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';


const KanbanColumn = ({ title, color, tickets, id, index }: any) => {
  const { user } = useAuth();
  const canDrag = user?.role === 'ADMIN' || user?.role === 'TECNICO';

  return (
    <Draggable draggableId={`column-${title}`} index={index} isDragDisabled={!canDrag}>
      {(providedCol) => (
        <div 
          ref={providedCol.innerRef}
          {...providedCol.draggableProps}
          style={{ 
            flex: 1, 
            minWidth: '300px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '15px',
            ...providedCol.draggableProps.style 
          }} 
        >
          <div 
            {...providedCol.dragHandleProps}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', cursor: canDrag ? 'grab' : 'default' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
            </div>
            <span style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              padding: '2px 10px', 
              borderRadius: '12px', 
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>{tickets.length}</span>
          </div>

          <Droppable droppableId={title} type="ticket">
            {(provided, snapshot) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '15px', 
                  minHeight: '200px',
                  background: snapshot.isDraggingOver ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                  borderRadius: '12px',
                  transition: 'background 0.2s ease',
                  padding: '5px'
                }}
              >
                {tickets.map((ticket: any, index: number) => (
                  <Draggable 
                    key={ticket.id.toString()} 
                    draggableId={ticket.id.toString()} 
                    index={index}
                    isDragDisabled={!canDrag}
                  >
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="glass-card" 
                        style={{ 
                          padding: '16px', 
                          cursor: canDrag ? 'grab' : 'pointer',
                          border: snapshot.isDragging ? '1px solid var(--senai-red)' : '1px solid var(--glass-border)',
                          boxShadow: snapshot.isDragging ? '0 10px 20px rgba(0,0,0,0.4)' : 'none',
                          ...provided.draggableProps.style 
                        }} 
                        onClick={() => ticket.onClick()}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--senai-red)', 
                            fontWeight: 700,
                            letterSpacing: '0.05em'
                          }}>#{ticket.id}</span>
                          <MoreVertical size={16} color="var(--text-secondary)" />
                        </div>
                        
                        <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', lineHeight: '1.4' }}>{ticket.descricao}</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <User size={14} /> <span>{ticket.solicitante}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <Tag size={14} /> <span>{ticket.local}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
};



const TicketEditModal = ({ ticket, onClose, onSave, onDelete }: any) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    status: ticket.status || 'Aberto',
    tipoServico: ticket.tipoServico || '',
    solucaoAplicada: ticket.solucaoAplicada || '',
    serieNova: ticket.serieNova || '',
    observacaoPatrimonio: ticket.observacaoPatrimonio || '',
    tecnicoResponsavel: ticket.tecnicoResponsavel || '',
  });

  const [options, setOptions] = useState({
    status: [] as any[],
    servicos: [] as any[],
    tecnicos: [] as any[],
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [resStatus, resServicos, resTecnicos] = await Promise.all([
          api.get('/status'),
          api.get('/tipos-servico'),
          api.get('/tecnicos'),
        ]);
        setOptions({
          status: resStatus.data,
          servicos: resServicos.data,
          tecnicos: resTecnicos.data,
        });
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(ticket.id, formData);
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '600px', padding: '30px', position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent' }}>
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={24} color="var(--senai-red)" /> Atualizar Chamado #{ticket.id}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Status do Atendimento</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="">Selecione...</option>
                {options.status?.map((s: any) => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                {(!options.status || options.status.length === 0) && (

                  <>
                    <option value="Aberto">Aberto</option>
                    <option value="Em Atendimento">Em Atendimento</option>
                    <option value="Aguardando Peça">Aguardando Peça</option>
                    <option value="Concluído">Concluído</option>
                  </>
                )}

              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Tipo de Serviço</label>
              <select 
                value={formData.tipoServico}
                onChange={(e) => setFormData({...formData, tipoServico: e.target.value})}
              >
                <option value="">Selecione...</option>
                {options.servicos?.map((s: any) => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                {(!options.servicos || options.servicos.length === 0) && (

                  <>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Rede">Rede</option>
                    <option value="Preventiva">Preventiva</option>
                  </>
                )}

              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Técnico Responsável</label>
              <select 
                value={formData.tecnicoResponsavel}
                onChange={(e) => setFormData({...formData, tecnicoResponsavel: e.target.value})}
              >
                <option value="">Selecione o técnico...</option>
                {options.tecnicos?.map((t: any) => <option key={t.id} value={t.nome}>{t.nome}</option>)}
              </select>

            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Nova Série (se houver troca)</label>
              <input 
                type="text"
                value={formData.serieNova}
                onChange={(e) => setFormData({...formData, serieNova: e.target.value})}
                placeholder="S/N do novo componente"
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <label>Descrição Técnica do Serviço (Solução)</label>
            <textarea 
              rows={3}
              value={formData.solucaoAplicada}
              onChange={(e) => setFormData({...formData, solucaoAplicada: e.target.value})}
              placeholder="Descreva o que foi feito..."
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <label>Observação do Patrimônio</label>
            <input 
              type="text"
              value={formData.observacaoPatrimonio}
              onChange={(e) => setFormData({...formData, observacaoPatrimonio: e.target.value})}
              placeholder="Ex: Tecla 'A' falhando"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '12px 25px', color: 'white' }}>
              Cancelar
            </button>

            <button type="submit" style={{ background: 'var(--senai-red)', color: 'white', padding: '12px 25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Save size={18} /> Salvar Alterações
            </button>
          </div>

          {user?.role === 'ADMIN' && (
            <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '30px', paddingTop: '20px' }}>
              <button 
                type="button" 
                onClick={() => onDelete(ticket.id)}
                style={{ background: 'rgba(237, 28, 36, 0.1)', color: 'var(--senai-red)', border: '1px solid rgba(237, 28, 36, 0.3)', width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <Trash2 size={18} /> Excluir Atendimento Permanentemente
              </button>
            </div>
          )}
        </form>

      </motion.div>
    </div>
  );
};

const GestaoChamados = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const columnColors = ['var(--senai-red)', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];


  const fetchData = async () => {
    try {
      const [resTickets, resStatus] = await Promise.all([
        api.get('/chamados'),
        api.get('/status')
      ]);
      setTickets(resTickets.data);
      setStatuses(resStatus.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleSaveTicket = async (id: string, updatedData: any) => {
    try {
      await api.patch(`/chamados/${id}`, updatedData);
      setSelectedTicket(null);
      fetchData();
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Erro ao atualizar chamado.');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja EXCLUIR permanentemente este chamado? Esta ação não pode ser desfeita.')) return;
    
    try {
      await api.delete(`/chamados/${id}`);
      setSelectedTicket(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('Erro ao excluir chamado. Apenas administradores podem realizar esta ação.');
    }
  };

  const handleOnDragEnd = async (result: any) => {
    const { source, destination, draggableId, type } = result;


    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'column') {
      const newStatuses = Array.from(statuses);
      const [removed] = newStatuses.splice(source.index, 1);
      newStatuses.splice(destination.index, 0, removed);

      setStatuses(newStatuses);

      try {
        const reorderData = newStatuses.map((s, idx) => ({ id: s.id, ordem: idx }));
        await api.post('/reorder/status', { items: reorderData });
      } catch (error) {
        console.error('Error reordering columns:', error);
        fetchData();
      }
      return;
    }

    // Movimentação Otimista de Tickets
    const newTickets = [...tickets];
    const draggedTicket = newTickets.find(t => t.id.toString() === draggableId);
    
    if (draggedTicket && source.droppableId !== destination.droppableId) {
      draggedTicket.status = destination.droppableId;
      setTickets(newTickets);

      try {
        await api.patch(`/chamados/${draggableId}`, { status: destination.droppableId });
      } catch (error) {
        console.error('Error updating ticket status on drag:', error);
        fetchData(); // Rollback
      }
    }
  };


  const getTicketsByStatus = (status: string, isFirstColumn: boolean = false) => {
    const targetStatus = (status || '').trim().toLowerCase();
    const mappedStatusNames = statuses.map(s => (s.nome || '').trim().toLowerCase());
    
    return tickets
      .filter(t => {
        const ticketStatus = (t.status || '').trim().toLowerCase();
        if (ticketStatus === targetStatus) return true;
        // Se for a primeira coluna e o status do ticket não estiver em nenhuma coluna, mostrar aqui
        if (isFirstColumn && !mappedStatusNames.includes(ticketStatus)) return true;
        return false;
      })
      .map(t => ({
        ...t,
        descricao: t.descricaoProblema,
        solicitante: t.nomeSolicitante,
        local: t.localOcorrencia,
        data: new Date(t.dataOcorrencia).toLocaleDateString('pt-BR'),
        onClick: () => setSelectedTicket(t)
      }));
  };




  return (
    <div style={{ padding: '30px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>Gestão de Chamados</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Gerencie o fluxo de atendimento da unidade</p>
      </header>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{ display: 'flex', gap: '25px', overflowX: 'auto', paddingBottom: '20px' }}
            >
              {statuses.length > 0 ? (
                statuses.map((s, index) => (
                  <KanbanColumn 
                    key={s.id}
                    id={s.id}
                    index={index}
                    title={s.nome} 
                    color={columnColors[index % columnColors.length]} 
                    tickets={getTicketsByStatus(s.nome, index === 0)} 
                  />
                ))
              ) : (

                <>
                  <KanbanColumn title="Aberto" color="var(--senai-red)" tickets={getTicketsByStatus('Aberto')} index={0} />
                  <KanbanColumn title="Em Atendimento" color="#3b82f6" tickets={getTicketsByStatus('Em Atendimento')} index={1} />
                  <KanbanColumn title="Aguardando Peça" color="#f59e0b" tickets={getTicketsByStatus('Aguardando Peça')} index={2} />
                  <KanbanColumn title="Concluído" color="#10b981" tickets={getTicketsByStatus('Concluído')} index={3} />
                </>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>





      <AnimatePresence>
        {selectedTicket && (
          <TicketEditModal 
            ticket={selectedTicket} 
            onClose={() => setSelectedTicket(null)} 
            onSave={handleSaveTicket} 
            onDelete={handleDeleteTicket}
          />

        )}
      </AnimatePresence>
    </div>
  );
};

export default GestaoChamados;
