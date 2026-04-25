import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AbrirChamado from './pages/AbrirChamado';
import GestaoChamados from './pages/GestaoChamados';
import Analytics from './pages/Analytics';
import Configuracoes from './pages/Configuracoes';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Auditoria from './pages/Auditoria';
import Usuarios from './pages/Usuarios';
import Agenda from './pages/Agenda';
import GestaoComputadores from './pages/GestaoComputadores';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'ADMIN') return <Navigate to="/" />;
  return <>{children}</>;
};


const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const sidebarWidth = sidebarCollapsed ? '80px' : '260px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      {isAuthenticated && (
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      )}
      <main style={{ 
        flex: 1, 
        marginLeft: isAuthenticated ? sidebarWidth : '0', 
        transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        width: isAuthenticated ? `calc(100% - ${sidebarWidth})` : '100%'
      }}>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/abrir-chamado" element={<ProtectedRoute><AbrirChamado /></ProtectedRoute>} />
          <Route path="/gestao" element={<ProtectedRoute><GestaoChamados /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
          <Route path="/auditoria" element={<ProtectedRoute><Auditoria /></ProtectedRoute>} />
          <Route path="/usuarios" element={<AdminRoute><Usuarios /></AdminRoute>} />
          <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
          <Route path="/ativos" element={<ProtectedRoute><GestaoComputadores /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
