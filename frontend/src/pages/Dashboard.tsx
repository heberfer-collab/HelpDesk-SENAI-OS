import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import api from '../services/api';

const KPICard = ({ title, value, icon: Icon, color }: any) => (
  <div className="glass-card" style={{ padding: '24px', flex: 1, minWidth: '240px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
      <div style={{ 
        background: `rgba(${color}, 0.1)`, 
        padding: '12px', 
        borderRadius: '12px',
        color: `rgb(${color})`
      }}>
        <Icon size={24} />
      </div>
      <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>+12%</span>
    </div>
    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '5px' }}>{title}</h3>
    <p style={{ fontSize: '1.8rem', fontWeight: 700 }}>{value}</p>
  </div>
);

const Dashboard = () => {
  const [view, setView] = useState<'week' | 'month' | 'year'>('week');
  const [kpis, setKpis] = useState({
    total: 0,
    abertos: 0,
    concluidosHoje: 0,
    tempoMedioResolucao: '0h'
  });
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resKpis, resCharts] = await Promise.all([
          api.get('/analytics/kpis'),
          api.get('/analytics/charts')
        ]);
        setKpis(resKpis.data);
        setChartData(resCharts.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  const currentData = chartData ? chartData[view] : [];
  const maxValue = Math.max(...currentData.map((d: any) => d.value), 1);


  return (
    <div style={{ padding: '30px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>Control Tower</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Visão geral da infraestrutura SENAI Votuporanga</p>
      </header>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <KPICard title="Chamados Abertos" value={kpis.abertos} icon={AlertCircle} color="237, 28, 36" />
        <KPICard title="Concluídos Hoje" value={kpis.concluidosHoje} icon={CheckCircle2} color="16, 185, 129" />
        <KPICard title="Tempo Médio" value={kpis.tempoMedioResolucao} icon={Clock} color="245, 158, 11" />
        <KPICard title="Total de Chamados" value={kpis.total} icon={TrendingUp} color="59, 130, 246" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Volume de Chamados</h3>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
              {(['week', 'month', 'year'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    background: view === v ? 'var(--senai-red)' : 'transparent',
                    color: view === v ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.3s ease',
                    textTransform: 'capitalize'
                  }}
                >
                  {v === 'week' ? 'Semana' : v === 'month' ? 'Mês' : 'Ano'}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '15px', 
            padding: '20px 0',
            height: '200px'
          }}>
            {currentData.map((d: any, i: number) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '100%', 
                  background: 'linear-gradient(to top, var(--senai-red), #ff4d4d)',
                  borderRadius: '6px 6px 0 0',
                  height: `${(d.value / maxValue) * 100}%`,
                  minHeight: d.value > 0 ? '4px' : '0',
                  transition: 'height 1s ease-out'
                }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', transform: 'rotate(-45deg)', marginTop: '5px' }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', minHeight: '400px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Chamados por Ambiente</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            {(chartData?.environments || []).map((env: any, i: number) => (
              <div key={env.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                  <span>{env.label}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{env.value}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                  <div style={{ 
                    width: `${(env.value / kpis.total) * 100}%`, 
                    height: '100%', 
                    background: 'var(--senai-red)', 
                    borderRadius: '3px',
                    transition: 'width 1s ease-out'
                  }} />
                </div>
              </div>
            ))}
            {(!chartData?.environments || chartData.environments.length === 0) && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Nenhum dado disponível</p>
            )}
          </div>
        </div>

      </div>


    </div>
  );
};

export default Dashboard;
