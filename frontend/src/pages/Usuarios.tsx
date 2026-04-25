import React, { useState, useEffect } from 'react';
import { Users, Edit2, Trash2, Search, UserPlus, X, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
  createdAt: string;
}

const Usuarios = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '', role: 'USUARIO', password: '' });
  const { token } = useAuth();


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert('Erro ao excluir usuário');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({ nome: '', email: '', role: 'USUARIO', password: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ nome: user.nome, email: user.email, role: user.role, password: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingUser 
        ? `http://localhost:3001/api/users/${editingUser.id}` 
        : 'http://localhost:3001/api/auth/register';
      
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.error || 'Falha na operação'}`);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };


  const filteredUsers = users.filter(user => 
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Users size={32} color="var(--senai-red)" />
            Gestão de Usuários
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie permissões e cadastros da equipe</p>
        </div>
        <button 
          onClick={handleAdd}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--senai-red)', 
            color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', 
            fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s'
          }}
        >
          <UserPlus size={20} />
          Novo Usuário
        </button>
      </header>


      <div style={{ 
        background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px',
        padding: '24px', backdropFilter: 'blur(10px)', marginBottom: '30px'
      }}>
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)', color: 'white', fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Usuário</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Nível</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Email</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>Carregando...</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.3s' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--senai-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {user.nome.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: '600' }}>{user.nome}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                      background: user.role === 'ADMIN' ? 'rgba(237, 28, 36, 0.2)' : 'rgba(255,255,255,0.1)',
                      color: user.role === 'ADMIN' ? 'var(--senai-red)' : 'var(--text-secondary)',
                      display: 'inline-flex', alignItems: 'center', gap: '6px'
                    }}>
                      {user.role === 'ADMIN' ? <Shield size={12} /> : <UserIcon size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => handleEdit(user)}
                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', cursor: 'pointer' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgba(237,28,36,0.3)', background: 'rgba(237,28,36,0.1)', color: 'var(--senai-red)', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)'
        }}>
          <div style={{ 
            background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '20px',
            width: '100%', maxWidth: '500px', padding: '32px'
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>


            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nome Completo</label>
                <input 
                  type="text" 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nível de Acesso</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#222', border: '1px solid var(--glass-border)', color: 'white' }}
                >
                  <option value="USUARIO">Usuário</option>
                  <option value="TECNICO">Técnico</option>
                  <option value="ADMIN">Administrador</option>
                </select>

              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  {editingUser ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha'}
                </label>
                <input 
                  type="password" 
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ 
                    flex: 1, padding: '14px', borderRadius: '12px', background: 'transparent', 
                    color: 'white', border: '1px solid var(--glass-border)', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  style={{ 
                    flex: 2, padding: '14px', borderRadius: '12px', background: 'var(--senai-red)', 
                    color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s'
                  }}
                >
                  {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>


            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
