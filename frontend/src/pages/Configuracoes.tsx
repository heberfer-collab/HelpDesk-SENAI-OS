import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, MapPin, Activity, Wrench, Users, ShieldCheck, Edit2, X, Save } from 'lucide-react';

import api from '../services/api';

const ConfigSection = ({ title, icon: Icon, endpoint, placeholder }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [newValue, setNewValue] = useState('');
  const [location, setLocation] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);


  const fetchItems = async () => {
    try {
      const response = await api.get(`/${endpoint}`);
      setItems(response.data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [endpoint]);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    try {
      const payload: any = { nome: newValue };
      if (endpoint === 'ambientes' && location.trim()) {
        payload.localizacao = location;
      }
      
      if (editingId) {
        await api.put(`/${endpoint}/${editingId}`, payload);
      } else {
        await api.post(`/${endpoint}`, payload);
      }

      setNewValue('');
      setLocation('');
      setEditingId(null);
      fetchItems();
    } catch (error) {
      console.error(`Error saving ${endpoint}:`, error);
      alert('Erro ao salvar item. Verifique se já existe ou conexão com servidor.');
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setNewValue(item.nome);
    setLocation(item.localizacao || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewValue('');
    setLocation('');
  };


  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este item?')) return;
    try {
      await api.delete(`/${endpoint}/${id}`);
      fetchItems();
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error);
      alert('Erro ao excluir item.');
    }
  };

  return (
    <div className="glass-card" style={{ padding: '25px' }}>
      <h2 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon size={18} color="var(--senai-red)" /> {title}
      </h2>

      <form onSubmit={handleAddOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder={placeholder} 
            style={{ flex: 1, padding: '10px', border: editingId ? '1px solid var(--senai-red)' : '1px solid var(--glass-border)' }}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          {endpoint !== 'ambientes' && (
            <button 
              type="submit"
              style={{ background: 'var(--senai-red)', color: 'white', padding: '8px 15px', borderRadius: '8px' }}
            >
              {editingId ? <Save size={18} /> : <Plus size={18} />}
            </button>
          )}
          {editingId && (
            <button 
              type="button"
              onClick={cancelEdit}
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 15px', borderRadius: '8px' }}
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        {endpoint === 'ambientes' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Localização (Ex: Bloco A, Piso 2)" 
              style={{ flex: 1, padding: '10px', border: editingId ? '1px solid var(--senai-red)' : '1px solid var(--glass-border)' }}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button 
              type="submit"
              style={{ background: 'var(--senai-red)', color: 'white', padding: '8px 15px', borderRadius: '8px' }}
            >
              {editingId ? <Save size={18} /> : <Plus size={18} />}
            </button>
          </div>
        )}
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
        {items.map((item) => (
          <div key={item.id} style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '10px 15px', background: editingId === item.id ? 'rgba(237, 28, 36, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
            borderRadius: '6px', fontSize: '0.9rem', border: editingId === item.id ? '1px solid var(--senai-red)' : '1px solid transparent'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '500' }}>{item.nome}</span>
              {item.localizacao && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={10} style={{ marginRight: '4px' }} />
                  {item.localizacao}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={() => handleEdit(item)} style={{ color: 'var(--text-secondary)', background: 'transparent', cursor: 'pointer', padding: '4px' }}>
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(item.id)} style={{ color: 'var(--text-secondary)', background: 'transparent', cursor: 'pointer', padding: '4px' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.8rem' }}>Nenhum item.</p>}
      </div>
    </div>
  );
};


const Configuracoes = () => {
  return (
    <div style={{ padding: '30px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>Configurações do Sistema</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Gerencie os parâmetros globais e listas dinâmicas</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
        <ConfigSection title="Ambientes / Locais" icon={MapPin} endpoint="ambientes" placeholder="Ex: Laboratório 05" />
        <ConfigSection title="Status de Atendimento" icon={Activity} endpoint="status" placeholder="Ex: Aguardando Peça" />
        <ConfigSection title="Tipos de Serviço" icon={Wrench} endpoint="tipos-servico" placeholder="Ex: Troca de Hardware" />
        <ConfigSection title="Responsáveis por Setor" icon={Users} endpoint="responsaveis-setor" placeholder="Ex: Prof. Ricardo" />
        <ConfigSection title="Técnicos de TI" icon={ShieldCheck} endpoint="tecnicos" placeholder="Ex: Felipe Silva" />
      </div>
    </div>
  );
};

export default Configuracoes;
