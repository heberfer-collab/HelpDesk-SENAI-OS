import { LayoutDashboard, PlusCircle, Kanban, BarChart3, Settings, LogOut, ShieldCheck, History, Users, ChevronLeft, ChevronRight, Menu, Calendar, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, path, active, collapsed }: any) => (
  <Link to={path} style={{ textDecoration: 'none' }}>
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderRadius: '10px',
      background: active ? 'rgba(237, 28, 36, 0.1)' : 'transparent',
      color: active ? 'var(--senai-red)' : 'var(--text-secondary)',
      transition: 'all 0.3s ease', cursor: 'pointer', marginBottom: '8px',
      justifyContent: collapsed ? 'center' : 'flex-start'
    }}>
      <Icon size={20} />
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          style={{ fontWeight: active ? '600' : '400', whiteSpace: 'nowrap' }}
        >
          {label}
        </motion.span>
      )}
    </div>
  </Link>
);


const Sidebar = ({ collapsed, onToggle }: any) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside style={{ 
      width: collapsed ? '80px' : '260px', 
      height: '100vh', 
      background: 'var(--card-bg)', 
      borderRight: '1px solid var(--glass-border)',
      padding: collapsed ? '30px 10px' : '30px 20px', 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'fixed', 
      left: 0, 
      top: 0,
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 100
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'space-between',
        marginBottom: '40px', 
        padding: '0 10px' 
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'var(--senai-red)', padding: '8px', borderRadius: '8px' }}>
              <ShieldCheck size={24} color="white" />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>HelpDesk</h2>
          </div>
        )}
        <button 
          onClick={onToggle}
          style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: 'none', 
            borderRadius: '8px', 
            padding: '8px', 
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav style={{ flex: 1 }}>
        <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/" active={location.pathname === '/'} collapsed={collapsed} />
        <SidebarItem icon={PlusCircle} label="Abrir Chamado" path="/abrir-chamado" active={location.pathname === '/abrir-chamado'} collapsed={collapsed} />
        <SidebarItem icon={Calendar} label="Agenda" path="/agenda" active={location.pathname === '/agenda'} collapsed={collapsed} />
        <SidebarItem icon={Monitor} label="Gestão de Ativos" path="/ativos" active={location.pathname === '/ativos'} collapsed={collapsed} />
        
        {(user?.role === 'ADMIN' || user?.role === 'TECNICO') && (
          <SidebarItem icon={Kanban} label="Gestão (Kanban)" path="/gestao" active={location.pathname === '/gestao'} collapsed={collapsed} />
        )}
        
        <SidebarItem icon={BarChart3} label="Relatórios" path="/analytics" active={location.pathname === '/analytics'} collapsed={collapsed} />
        
        {user?.role === 'ADMIN' && (
          <>
            <SidebarItem icon={History} label="Auditoria (Logs)" path="/auditoria" active={location.pathname === '/auditoria'} collapsed={collapsed} />
            <SidebarItem icon={Users} label="Usuários" path="/usuarios" active={location.pathname === '/usuarios'} collapsed={collapsed} />
            <SidebarItem icon={Settings} label="Configurações" path="/configuracoes" active={location.pathname === '/configuracoes'} collapsed={collapsed} />
          </>
        )}
      </nav>


      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '20px' }}>
        <div style={{ 
          padding: '0 10px 15px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <div style={{ 
            width: '35px', 
            height: '35px', 
            borderRadius: '50%', 
            background: 'var(--senai-red)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 'bold', 
            fontSize: '0.9rem',
            flexShrink: 0
          }}>
            {user?.nome?.substring(0, 1).toUpperCase()}
          </div>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.nome}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.role}</div>
            </motion.div>
          )}
        </div>
        <div 
          onClick={logout}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderRadius: '10px',
            color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.3s ease',
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}
        >
          <LogOut size={20} />
          {!collapsed && <span>Sair do Sistema</span>}
        </div>
      </div>
    </aside>

  );
};

export default Sidebar;
