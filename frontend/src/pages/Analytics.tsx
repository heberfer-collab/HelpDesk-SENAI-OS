import React, { useState, useEffect } from 'react';
import { Search, History, HardDrive, MapPinned, FileSpreadsheet, Download } from 'lucide-react';
import api from '../services/api';
import * as XLSX from 'xlsx';



const Analytics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resTickets, resAnalytics] = await Promise.all([
          api.get('/chamados'),
          api.get('/analytics/charts')
        ]);
        setTickets(resTickets.data);
        setAnalytics(resAnalytics.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };
    fetchData();
  }, []);

  const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatorio");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const filteredHistory = tickets.filter(t => 
    t.patrimonio && t.patrimonio.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div style={{ padding: '30px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>Relatórios & Analytics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Análise detalhada e histórico de manutenção</p>
      </header>

      <section className="glass-card" style={{ padding: '30px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Search size={20} color="var(--senai-red)" /> Histórico por Patrimônio
          </h2>
          <button 
            onClick={() => exportToExcel(tickets, 'todos_os_chamados')}
            style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: '#10b981', 
              border: '1px solid #10b981',
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px'
            }}
          >
            <FileSpreadsheet size={18} /> Exportar Geral
          </button>
        </div>

        
        <div style={{ position: 'relative', marginBottom: '30px' }}>
          <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
          <input 
            type="text" 
            placeholder="Digite o número do patrimônio..." 
            style={{ width: '100%', paddingLeft: '45px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {searchTerm && (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
              <button 
                onClick={() => exportToExcel(filteredHistory, `relatorio_patrimonio_${searchTerm}`)}
                style={{ background: 'var(--senai-red)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.85rem' }}
              >
                <Download size={16} /> Exportar Filtrados
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <th style={{ padding: '15px 10px' }}>ID Chamado</th>
                  <th style={{ padding: '15px 10px' }}>Data</th>
                  <th style={{ padding: '15px 10px' }}>Ocorrência</th>
                  <th style={{ padding: '15px 10px' }}>Solução Aplicada</th>
                  <th style={{ padding: '15px 10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '15px 10px', color: 'var(--senai-red)', fontWeight: 600 }}>#{item.id}</td>
                    <td style={{ padding: '15px 10px' }}>{new Date(item.dataOcorrencia).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: '15px 10px' }}>{item.descricaoProblema}</td>
                    <td style={{ padding: '15px 10px' }}>{item.solucaoTecnica || 'Pendente'}</td>
                    <td style={{ padding: '15px 10px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem',
                        background: (item.status || '').toLowerCase().includes('concluid') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: (item.status || '').toLowerCase().includes('concluid') ? '#10b981' : '#f59e0b'
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        )}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPinned size={18} color="var(--senai-red)" /> Chamados por Ambiente
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {(analytics?.environments || []).map((env: any) => (
              <div key={env.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                  <span>{env.label}</span>
                  <span>{env.value}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                  <div style={{ width: `${(env.value / (tickets.length || 1)) * 100}%`, height: '100%', background: 'var(--senai-red)', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={18} color="var(--senai-red)" /> Maiores Solicitantes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {Array.from(new Set(tickets.map(t => t.nomeSolicitante))).slice(0, 5).map(nome => {
              const count = tickets.filter(t => t.nomeSolicitante === nome).length;
              return (
                <div key={nome}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                    <span>{nome}</span>
                    <span>{count}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                    <div style={{ width: `${(count / (tickets.length || 1)) * 100}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Analytics;
