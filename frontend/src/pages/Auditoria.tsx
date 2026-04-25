import React, { useState, useEffect } from 'react';
import { History, User, Clock, Info } from 'lucide-react';
import api from '../services/api';

const Auditoria = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/logs');
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div style={{ padding: '30px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>Logs de Auditoria</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Histórico completo de atividades no sistema</p>
      </header>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <th style={{ padding: '15px 20px' }}>Usuário</th>
              <th style={{ padding: '15px 20px' }}>Ação</th>
              <th style={{ padding: '15px 20px' }}>Detalhes</th>
              <th style={{ padding: '15px 20px' }}>Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '15px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={16} color="var(--senai-red)" />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{log.user?.nome || 'Sistema'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.user?.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '15px 20px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '4px', 
                    background: 'rgba(237, 28, 36, 0.1)', color: 'var(--senai-red)', fontSize: '0.8rem' 
                  }}>
                    {log.acao}
                  </span>
                </td>
                <td style={{ padding: '15px 20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {log.detalhes}
                </td>
                <td style={{ padding: '15px 20px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                    <Clock size={14} color="var(--text-secondary)" />
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Nenhum log registrado ainda.
          </div>
        )}
      </div>
    </div>
  );
};

export default Auditoria;
