import React, { useState } from 'react';
import { LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao fazer login');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ background: 'var(--senai-red)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem' }}>Acesso ao Sistema</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>HelpDesk SENAI Votuporanga</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} /> E-mail
            </label>
            <input 
              type="email" 
              placeholder="seu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" style={{ background: 'var(--senai-red)', color: 'white', padding: '12px', marginTop: '10px', fontWeight: 'bold' }}>
            Entrar
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Não tem conta? <Link to="/registro" style={{ color: 'var(--senai-red)', textDecoration: 'none' }}>Registre-se aqui</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
