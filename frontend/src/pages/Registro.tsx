import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Registro = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/auth/register', formData);
      alert('Usuário registrado com sucesso! Faça login.');
      navigate('/login');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao registrar usuário');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '1.5rem' }}>Criar Conta</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cadastro de equipe técnica</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={14} /> Nome Completo
            </label>
            <input 
              type="text" 
              placeholder="Ex: Pedro Alvares" 
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} /> E-mail
            </label>
            <input 
              type="email" 
              placeholder="seu@email.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={14} /> Senha
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <button type="submit" style={{ background: 'var(--senai-red)', color: 'white', padding: '12px', marginTop: '10px', fontWeight: 'bold' }}>
            Cadastrar
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Já tem conta? <Link to="/login" style={{ color: 'var(--senai-red)', textDecoration: 'none' }}>Faça login</Link>
        </p>
      </div>
    </div>
  );
};

export default Registro;
