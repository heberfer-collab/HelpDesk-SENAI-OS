import React, { useState, useEffect } from 'react';
import { Monitor, RefreshCw, Trash2, Plus, Search, Filter, Cpu, Wifi, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const ComputerCard = ({ computer, onDelete }: any) => {
  const isOnline = (lastSeen: string) => {
    const diff = (new Date().getTime() - new Date(lastSeen).getTime()) / 1000 / 60;
    return diff < 10; // Considera online se o último pulso foi nos últimos 10 minutos
  };

  const online = isOnline(computer.lastSeen);

  return (
    <motion.div 
      layout
      className="glass-card" 
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            background: online ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
            padding: '10px', 
            borderRadius: '10px',
            color: online ? 'var(--success)' : 'var(--text-secondary)'
          }}>
            <Monitor size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>{computer.nome}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{computer.ambiente}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: online ? 'var(--success)' : '#666',
            boxShadow: online ? '0 0 10px var(--success)' : 'none'
          }} />
          <span style={{ fontSize: '0.7rem', fontWeight: '600', color: online ? 'var(--success)' : 'var(--text-secondary)' }}>
            {online ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Hash size={14} />
          <span>Pat: <strong>{computer.patrimonio || 'N/A'}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Cpu size={14} />
          <span>Série: <strong>{computer.numeroSerie || 'N/A'}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Wifi size={14} />
          <span>IP: <strong>{computer.ip || '0.0.0.0'}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', gridColumn: 'span 2' }}>
          <User size={14} />
          <span>Resp: <strong>{computer.responsavelSetor || 'N/A'}</strong></span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '15px', marginTop: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>MAC: {computer.macAddress}</span>
        <button 
          onClick={() => onDelete(computer.id)}
          style={{ background: 'rgba(237, 28, 36, 0.1)', color: 'var(--senai-red)', padding: '6px', borderRadius: '6px' }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

const GestaoComputadores = () => {
  const [computers, setComputers] = useState<any[]>([]);
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAmbiente, setFilterAmbiente] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newComp, setNewComp] = useState({ 
    nome: '', 
    patrimonio: '', 
    numeroSerie: '', 
    macAddress: '', 
    ambiente: '',
    responsavelSetor: ''
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchComputers, 30000); 
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    // Carrega Ambientes
    api.get('/ambientes')
      .then(res => {
        setAmbientes(res.data);
        if (res.data.length > 0) {
          setNewComp(prev => ({ ...prev, ambiente: res.data[0].nome }));
        }
      })
      .catch(err => console.error('Erro ao carregar ambientes:', err));

    // Carrega Responsáveis
    api.get('/responsaveis-setor')
      .then(res => {
        setResponsaveis(res.data);
        if (res.data.length > 0) {
          setNewComp(prev => ({ ...prev, responsavelSetor: res.data[0].nome }));
        }
      })
      .catch(err => console.error('Erro ao carregar responsáveis:', err));

    // Carrega Computadores
    fetchComputers();
  };

  const fetchComputers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/computadores');
      setComputers(res.data);
    } catch (err) {
      console.error('Erro ao carregar computadores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir este computador do inventário?')) return;
    try {
      await api.delete(`/computadores/${id}`);
      fetchComputers();
    } catch (err) {
      alert('Erro ao excluir');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Garantir que temos os valores iniciais se o usuário não mexer nos selects
    const dataToSend = {
      ...newComp,
      ambiente: newComp.ambiente || (ambientes.length > 0 ? ambientes[0].nome : ''),
      responsavelSetor: newComp.responsavelSetor || (responsaveis.length > 0 ? responsaveis[0].nome : '')
    };

    if (!dataToSend.ambiente || !dataToSend.responsavelSetor) {
      alert('Por favor, selecione um Ambiente e um Responsável.');
      return;
    }

    try {
      await api.post('/computadores', dataToSend);
      setShowAddModal(false);
      setNewComp({ 
        nome: '', 
        patrimonio: '', 
        numeroSerie: '', 
        macAddress: '', 
        ambiente: ambientes[0]?.nome || '',
        responsavelSetor: responsaveis[0]?.nome || ''
      });
      fetchComputers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro desconhecido ao cadastrar.';
      alert(`Erro ao cadastrar: ${errorMsg}\n\nDica: Verifique se o MAC Address ou Patrimônio já estão cadastrados em outra máquina.`);
    }
  };

  const listaAmbientesFiltro = ['Todos', ...Array.from(new Set(computers.map(c => c.ambiente)))];

  const filtered = computers.filter(c => 
    (filterAmbiente === 'Todos' || c.ambiente === filterAmbiente) &&
    (c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.patrimonio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     c.macAddress.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ padding: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Monitor size={32} color="var(--senai-red)" />
            Gestão de Ativos
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Monitoramento e inventário de computadores da rede.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ 
            background: 'var(--senai-red)', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontWeight: '600'
          }}
        >
          <Plus size={20} /> Novo Computador
        </button>
      </header>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome, MAC ou patrimônio..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '45px', background: 'var(--card-bg)' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--card-bg)', padding: '0 15px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <Filter size={18} color="var(--text-secondary)" />
          <select 
            value={filterAmbiente} 
            onChange={(e) => setFilterAmbiente(e.target.value)}
            style={{ background: 'transparent', border: 'none', padding: '12px' }}
          >
            {listaAmbientesFiltro.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>Carregando inventário...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          <AnimatePresence>
            {filtered.map(comp => (
              <ComputerCard key={comp.id} computer={comp} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de Adição */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card" 
            style={{ width: '100%', maxWidth: '500px', padding: '30px' }}
          >
            <h2 style={{ marginBottom: '20px' }}>Cadastrar Novo Ativo</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input placeholder="Nome do Computador (Ex: LAB01-PC01)" value={newComp.nome} onChange={e => setNewComp({...newComp, nome: e.target.value})} required />
              <input placeholder="MAC Address (Ex: AA:BB:CC:DD:EE:FF)" value={newComp.macAddress} onChange={e => setNewComp({...newComp, macAddress: e.target.value})} required />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input placeholder="Patrimônio" value={newComp.patrimonio} onChange={e => setNewComp({...newComp, patrimonio: e.target.value})} />
                <input placeholder="Nº de Série" value={newComp.numeroSerie} onChange={e => setNewComp({...newComp, numeroSerie: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Ambiente / Local</label>
                  <select 
                    value={newComp.ambiente} 
                    onChange={e => setNewComp({...newComp, ambiente: e.target.value})}
                    required
                    style={{ 
                      width: '100%', 
                      background: '#1a1a1e', 
                      color: 'white', 
                      padding: '12px', 
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      cursor: 'pointer'
                    }}
                  >
                    {ambientes.length === 0 && <option value="">Carregando...</option>}
                    {ambientes.map(a => <option key={a.id} value={a.nome}>{a.nome}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Responsável do Setor</label>
                  <select 
                    value={newComp.responsavelSetor} 
                    onChange={e => setNewComp({...newComp, responsavelSetor: e.target.value})}
                    required
                    style={{ 
                      width: '100%', 
                      background: '#1a1a1e', 
                      color: 'white', 
                      padding: '12px', 
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      cursor: 'pointer'
                    }}
                  >
                    {responsaveis.length === 0 && <option value="">Carregando...</option>}
                    {responsaveis.map(r => <option key={r.id} value={r.nome}>{r.nome}</option>)}
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)' }}>Cancelar</button>
                <button type="submit" style={{ flex: 2, padding: '12px', background: 'var(--senai-red)', color: 'white' }}>Cadastrar Computador</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GestaoComputadores;
