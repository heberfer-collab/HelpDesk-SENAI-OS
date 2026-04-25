import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Calendar as CalendarIcon, Clock, MapPin, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Agenda = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [chamados, setChamados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    fetchChamados();
  }, []);

  const fetchChamados = async () => {
    try {
      const response = await api.get('/chamados');
      setChamados(response.data);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const days = [];
  // Add empty slots for the first week
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const getChamadosForDay = (date: Date) => {
    return chamados.filter(c => {
      const d = new Date(c.dataOcorrencia || c.dataSolicitacao);
      return d.getDate() === date.getDate() && 
             d.getMonth() === date.getMonth() && 
             d.getFullYear() === date.getFullYear();
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CalendarIcon size={32} color="var(--senai-red)" />
            Agenda de Atendimentos
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>
            Acompanhe os serviços realizados por data e técnico.
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--card-bg)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <button onClick={prevMonth} className="nav-btn" style={{ background: 'none', color: 'white', padding: '5px' }}>
            <ChevronLeft size={24} />
          </button>
          <h2 style={{ fontSize: '1.2rem', minWidth: '150px', textAlign: 'center' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="nav-btn" style={{ background: 'none', color: 'white', padding: '5px' }}>
            <ChevronRight size={24} />
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '10px' }}>
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600', padding: '10px', fontSize: '0.9rem' }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDate.getTime()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'contents' }}
          >
            {days.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} style={{ minHeight: '120px' }} />;
              
              const dayChamados = getChamadosForDay(date);
              const isSelected = selectedDay && date.getTime() === selectedDay.getTime();

              return (
                <div
                  key={date.getTime()}
                  onClick={() => setSelectedDay(date)}
                  className="glass-card"
                  style={{
                    minHeight: '140px',
                    padding: '12px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    border: isSelected ? '2px solid var(--senai-red)' : isToday(date) ? '1px solid rgba(237, 28, 36, 0.4)' : '1px solid var(--glass-border)',
                    background: isToday(date) ? 'rgba(237, 28, 36, 0.05)' : 'var(--card-bg)'
                  }}
                >
                  <span style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '700', 
                    color: isToday(date) ? 'var(--senai-red)' : 'var(--text-primary)',
                    display: 'block',
                    marginBottom: '10px'
                  }}>
                    {date.getDate()}
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {dayChamados.slice(0, 3).map((c: any) => (
                      <div 
                        key={c.id} 
                        style={{ 
                          fontSize: '0.7rem', 
                          background: 'rgba(255,255,255,0.05)', 
                          padding: '4px 8px', 
                          borderRadius: '6px',
                          borderLeft: `3px solid ${c.status === 'Concluído' ? 'var(--success)' : 'var(--warning)'}`,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{c.tecnicoResponsavel || 'S/T'}</span>: {c.descricaoProblema}
                      </div>
                    ))}
                    {dayChamados.length > 3 && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        + {dayChamados.length - 3} atendimentos
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: '40px' }}
        >
          <div className="glass-card" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Atendimentos de {selectedDay.toLocaleDateString('pt-BR')}
            </h3>
            
            {getChamadosForDay(selectedDay).length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {getChamadosForDay(selectedDay).map((c: any) => (
                  <div key={c.id} style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    padding: '20px', 
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '4px 10px', 
                        borderRadius: '20px',
                        background: c.status === 'Concluído' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: c.status === 'Concluído' ? 'var(--success)' : 'var(--warning)',
                        fontWeight: '600'
                      }}>
                        {c.status}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>#{c.id}</span>
                    </div>

                    <h4 style={{ fontSize: '1rem', marginBottom: '15px' }}>{c.descricaoProblema}</h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <User size={16} />
                        <span>Técnico: <strong style={{ color: 'var(--text-primary)' }}>{c.tecnicoResponsavel || 'Não atribuído'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <MapPin size={16} />
                        <span>Ambiente: <strong style={{ color: 'var(--text-primary)' }}>{c.localOcorrencia}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <Tag size={16} />
                        <span>Tipo: <strong style={{ color: 'var(--text-primary)' }}>{c.tipoServico || 'N/A'}</strong></span>
                      </div>
                      {c.horaInicioAtendimento && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                          <Clock size={16} />
                          <span>Início: <strong style={{ color: 'var(--text-primary)' }}>{new Date(c.horaInicioAtendimento).toLocaleTimeString('pt-BR')}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                Nenhum atendimento registrado para esta data.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Agenda;
