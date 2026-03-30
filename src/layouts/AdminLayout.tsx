import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, DollarSign, Warehouse, UsersRound, Settings, LogOut, ChevronRight, Tractor, Package } from 'lucide-react';
import { useAgro } from '../contexts/AgroContext';

const AdminLayout = () => {
  const { currentUser, companies, logout } = useAgro();
  const navigate = useNavigate();
  const location = useLocation();
  const company = companies.find(c => c.id === currentUser?.companyId);

  const isFinanceiroUser = currentUser?.role === 'collaborator' && !!currentUser?.permissions?.canManageFinancial;

  useEffect(() => {
    // 1. Se for colaborador comum sem permissao, ejeta
    if (currentUser?.role === 'collaborator' && !currentUser?.permissions?.canManageFinancial) {
      navigate('/user');
    }
    
    // 2. Se for financeiro e tentar acessar tela nao permitida
    if (isFinanceiroUser) {
      const allowedPaths = ['/app/financeiro', '/app/operacao', '/app/estoque'];
      const isAllowed = allowedPaths.some(p => location.pathname.includes(p));
      if (!isAllowed) {
        navigate('/app/financeiro');
      }
    }
  }, [currentUser, location.pathname, navigate, isFinanceiroUser]);

  // Menu atualizado com Financeiro e Estoque e Filtrado para o perfil do Financeiro
  const menu = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Operação', path: '/app/operacao', icon: Activity },
    { name: 'Financeiro', path: '/app/financeiro', icon: DollarSign },
    { name: 'Estoque', path: '/app/estoque', icon: Warehouse },
    { name: 'Produtores', path: '/app/produtores', icon: Tractor },
    { name: 'Produtos', path: '/app/produtos', icon: Package },
    { name: 'Usuários', path: '/app/usuarios', icon: UsersRound },
    { name: 'Configurações', path: '/app/configuracoes', icon: Settings },
  ].filter(item => {
    if (isFinanceiroUser) {
      return ['Financeiro', 'Operação', 'Estoque'].includes(item.name);
    }
    return true;
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Sidebar Premium */}
      <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col shadow-sm z-20 relative">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {company?.logo ? (
              <img src={company.logo} alt="Eleven Tech" className="h-10 object-contain max-w-[170px]" />
            ) : (
              <span className="text-xl font-black tracking-tight" style={{ color: 'var(--primary-color)' }}>Eleven Tech</span>
            )}
          </div>
        </div>
        
        <div className="py-6 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-6">Gestão da Empresa</p>
          <div className="space-y-1.5 px-3">
            {menu.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.includes(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group border ${
                    isActive 
                      ? 'shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                  }`}
                  style={isActive ? { 
                    backgroundColor: 'color-mix(in srgb, var(--primary-color), white 90%)',
                    color: 'var(--primary-color)',
                    borderColor: 'color-mix(in srgb, var(--primary-color), white 80%)'
                  } : {}}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} style={{ color: isActive ? 'var(--primary-color)' : 'inherit' }} className={!isActive ? 'text-slate-400 group-hover:text-slate-600' : ''} />
                    <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={14} style={{ color: 'var(--primary-color)' }} />}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-inner overflow-hidden"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  currentUser?.name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{currentUser?.name}</p>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">
                  {currentUser?.role === 'admin' ? 'Administrador' : 'Colaborador - Operação'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors bg-white border border-slate-200 hover:border-red-100"
            >
              <LogOut size={16} /> <span className="text-xs font-bold">Sair da Conta</span>
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
             <div className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-4 py-1.5 rounded-full font-bold flex items-center gap-2 shadow-sm">
               <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
               Modo Simulado
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;