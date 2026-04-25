import React, { useState, useEffect } from 'react';
import { User, MapPin, Monitor, ClipboardList, Send, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';


const AbrirChamado = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nomeSolicitante: user?.nome || '',
    emailSolicitante: user?.email || '',
    localOcorrencia: '',
    responsavelAmbiente: '',
    patrimonio: '',
    serieOriginal: '',
    descricaoProblema: '',
  });

  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAmb, resResp] = await Promise.all([
          api.get('/ambientes'),
          api.get('/responsaveis-setor'),
        ]);
        setAmbientes(resAmb.data);
        setResponsaveis(resResp.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    try {
      await api.post('/chamados', {
        ...formData,
        dataOcorrencia: new Date().toISOString(),
        status: 'Aberto'
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Erro ao enviar chamado. Verifique a conexão com o servidor.');
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Novo Chamado</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Preencha os dados abaixo para solicitar suporte técnico</p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px', gap: '10px' }}>
        <div style={{ 
          width: '40px', height: '40px', borderRadius: '50%', 
          background: step >= 1 ? 'var(--senai-red)' : 'var(--card-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold'
        }}>1</div>
        <div style={{ width: '100px', height: '2px', background: 'var(--glass-border)', alignSelf: 'center' }} />
        <div style={{ 
          width: '40px', height: '40px', borderRadius: '50%', 
          background: step >= 2 ? 'var(--senai-red)' : 'var(--card-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold'
        }}>2</div>
      </div>

      <div className="glass-card" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ color: 'var(--success)', marginBottom: '20px' }}>
              <CheckCircle2 size={64} />
            </div>
            <h2 style={{ marginBottom: '10px' }}>Chamado Enviado!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
              Sua solicitação foi registrada com sucesso. Um técnico entrará em contato em breve.
            </p>
            <button 
              type="button"
              onClick={() => {
                setSubmitted(false); 
                setStep(1); 
                setFormData({
                  nomeSolicitante: user?.nome || '',
                  emailSolicitante: user?.email || '',
                  localOcorrencia: '',
                  responsavelAmbiente: '',
                  patrimonio: '',
                  serieOriginal: '',
                  descricaoProblema: '',
                });
              }}
              style={{ background: 'var(--senai-red)', color: 'white', padding: '12px 25px' }}
            >
              Abrir Novo Chamado
            </button>

          </div>
        ) : step === 1 ? (
          <div>
            <h2 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={24} color="var(--senai-red)" /> Dados do Solicitante
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Ex: João Silva" 
                  value={formData.nomeSolicitante}
                  onChange={(e) => setFormData({...formData, nomeSolicitante: e.target.value})}
                  readOnly={user?.role !== 'ADMIN'}
                  style={{ opacity: user?.role !== 'ADMIN' ? 0.7 : 1, cursor: user?.role !== 'ADMIN' ? 'not-allowed' : 'text' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>E-mail Institucional</label>
                <input 
                  type="email" 
                  placeholder="email@sp.senai.br" 
                  value={formData.emailSolicitante}
                  onChange={(e) => setFormData({...formData, emailSolicitante: e.target.value})}
                  readOnly={user?.role !== 'ADMIN'}
                  style={{ opacity: user?.role !== 'ADMIN' ? 0.7 : 1, cursor: user?.role !== 'ADMIN' ? 'not-allowed' : 'text' }}
                />
              </div>
            </div>


            <h2 style={{ marginBottom: '25px', marginTop: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={24} color="var(--senai-red)" /> Local da Ocorrência
            </h2>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Ambiente</label>
                <select 
                  value={formData.localOcorrencia}
                  onChange={(e) => setFormData({...formData, localOcorrencia: e.target.value})}
                >
                  <option value="">Selecione o local</option>
                  {ambientes && ambientes.length > 0 ? (
                    ambientes.map((amb) => (
                      <option key={amb.id} value={amb.nome}>
                        {amb.nome} {amb.localizacao ? `(${amb.localizacao})` : ''}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Administração">Administração</option>
                      <option value="Laboratório de Informática">Laboratório de Informática</option>
                      <option value="Oficinas">Oficinas</option>
                      <option value="Salas de Aula Teóricas">Salas de Aula Teóricas</option>
                    </>
                  )}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Responsável pelo Setor</label>
                <select 
                  value={formData.responsavelAmbiente}
                  onChange={(e) => setFormData({...formData, responsavelAmbiente: e.target.value})}
                >
                  <option value="">Selecione o responsável</option>
                  {responsaveis.map((r: any) => <option key={r.id} value={r.nome}>{r.nome}</option>)}
                  {responsaveis.length === 0 && (
                    <option value="Não cadastrado">Não cadastrado</option>
                  )}
                </select>
              </div>
            </div>


            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
              <button 
                type="button" 
                onClick={nextStep}
                style={{ 
                  background: 'var(--senai-red)', color: 'white', padding: '12px 25px', 
                  display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600
                }}
              >
                Próximo Passo <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Monitor size={24} color="var(--senai-red)" /> Equipamento
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Nº do Patrimônio</label>
                <input 
                  type="text" 
                  placeholder="Ex: 123456" 
                  value={formData.patrimonio}
                  onChange={(e) => setFormData({...formData, patrimonio: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Série Original</label>
                <input 
                  type="text" 
                  placeholder="S/N do equipamento" 
                  value={formData.serieOriginal}
                  onChange={(e) => setFormData({...formData, serieOriginal: e.target.value})}
                />
              </div>
            </div>


            <h2 style={{ marginBottom: '25px', marginTop: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ClipboardList size={24} color="var(--senai-red)" /> Descrição do Problema
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea 
                rows={4} 
                placeholder="Descreva detalhadamente o que está ocorrendo..."
                value={formData.descricaoProblema}
                onChange={(e) => setFormData({...formData, descricaoProblema: e.target.value})}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
              <button 
                type="button" 
                onClick={prevStep}
                style={{ 
                  background: 'transparent', color: 'white', padding: '12px 25px', 
                  display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--glass-border)'
                }}
              >
                <ChevronLeft size={18} /> Voltar
              </button>
              <button 
                type="button"
                onClick={handleSubmit}
                style={{ 
                  background: 'var(--senai-red)', color: 'white', padding: '12px 25px', 
                  display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600
                }}
              >
                Enviar Chamado <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbrirChamado;
