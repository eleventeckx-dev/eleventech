import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, Activity, DollarSign, Warehouse, UsersRound, Settings, LogOut, ChevronRight, Tractor, Package, MoreHorizontal, X } from 'lucide-react';
import { useAgro } from '../contexts/AgroContext';

const AdminLayout = () => {
  const { currentUser, companies, logout } = useAgro();
  const navigate = useNavigate();
  const location = useLocation();
  const { companySlug } = useParams<{ companySlug: string }>();
  const company = companies.find(c => c.id === currentUser?.companyId);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  const isFinanceiroUser = currentUser?.role === 'collaborator' && !!currentUser?.permissions?.canManageFinancial;

  useEffect(() => {
    // 1. Se for colaborador comum sem permissao, ejeta
    if (currentUser?.role === 'collaborator' && !currentUser?.permissions?.canManageFinancial) {
      navigate(`/${companySlug}/user`);
    }
    
    // 2. Se for financeiro e tentar acessar tela nao permitida
    if (isFinanceiroUser) {
      const allowedPaths = ['financeiro', 'operacao', 'estoque'];
      const isAllowed = allowedPaths.some(p => location.pathname.includes(p));
      if (!isAllowed) {
        navigate(`/${companySlug}/app/financeiro`);
      }
    }
  }, [currentUser, location.pathname, navigate, isFinanceiroUser, companySlug]);

  // Close mobile more menu on route change
  useEffect(() => {
    setMobileMoreOpen(false);
  }, [location.pathname]);

  // Menu atualizado com Financeiro e Estoque e Filtrado para o perfil do Financeiro
  const menu = [
    { name: 'Dashboard', path: `/${companySlug}/app/dashboard`, icon: LayoutDashboard },
    { name: 'Operação', path: `/${companySlug}/app/operacao`, icon: Activity },
    { name: 'Financeiro', path: `/${companySlug}/app/financeiro`, icon: DollarSign },
    { name: 'Estoque', path: `/${companySlug}/app/estoque`, icon: Warehouse },
    { name: 'Produtores', path: `/${companySlug}/app/produtores`, icon: Tractor },
    { name: 'Produtos', path: `/${companySlug}/app/produtos`, icon: Package },
    { name: 'Usuários', path: `/${companySlug}/app/usuarios`, icon: UsersRound },
    { name: 'Configurações', path: `/${companySlug}/app/configuracoes`, icon: Settings },
  ].filter(item => {
    if (isFinanceiroUser) {
      return ['Financeiro', 'Operação', 'Estoque'].includes(item.name);
    }
    return true;
  });

  // Mobile: 4 primary tabs + "Mais..."
  const mobileMainTabs = menu.slice(0, 4);
  const mobileMoreTabs = menu.slice(4);

  const handleLogout = async () => {
    const slug = companySlug;
    await logout();
    navigate(`/${slug}`);
  };

  const isMoreActive = mobileMoreTabs.some(item => location.pathname.includes(item.path));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Sidebar Premium — Desktop only */}
      <aside className="hidden md:flex w-[260px] bg-white border-r border-slate-200 flex-col shadow-sm z-20 relative">
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
        <header className="h-14 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile logo */}
            <div className="flex md:hidden items-center shrink-0">
              {company?.logo ? (
                <img src={company.logo} alt="Logo" className="h-7 object-contain max-w-[100px]" />
              ) : (
                <span className="text-base font-black tracking-tight" style={{ color: 'var(--primary-color)' }}>ET</span>
              )}
            </div>
            <h1 className="text-lg md:text-2xl font-bold text-slate-800 tracking-tight truncate capitalize">
              {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             <div className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] md:text-xs px-2.5 md:px-4 py-1 md:py-1.5 rounded-full font-bold flex items-center gap-1.5 md:gap-2 shadow-sm">
               <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-500 animate-pulse"></span>
               <span className="hidden sm:inline">Modo Simulado</span>
               <span className="sm:hidden">Simulado</span>
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 pb-20 md:p-8 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Bottom Navigation — Mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden bg-white border-t border-slate-200 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex w-full">
          {mobileMainTabs.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center justify-center py-2 pt-2.5 gap-0.5 transition-colors relative ${
                  isActive ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full" style={{ backgroundColor: 'var(--primary-color)' }} />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} style={isActive ? { color: 'var(--primary-color)' } : {}} />
                <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`} style={isActive ? { color: 'var(--primary-color)' } : {}}>
                  {item.name}
                </span>
              </Link>
            );
          })}
          {/* More button */}
          {mobileMoreTabs.length > 0 && (
            <button
              onClick={() => setMobileMoreOpen(true)}
              className={`flex-1 flex flex-col items-center justify-center py-2 pt-2.5 gap-0.5 transition-colors relative ${
                isMoreActive ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {isMoreActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full" style={{ backgroundColor: 'var(--primary-color)' }} />
              )}
              <MoreHorizontal size={20} strokeWidth={isMoreActive ? 2.5 : 2} style={isMoreActive ? { color: 'var(--primary-color)' } : {}} />
              <span className={`text-[10px] leading-tight ${isMoreActive ? 'font-bold' : 'font-medium'}`} style={isMoreActive ? { color: 'var(--primary-color)' } : {}}>
                Mais
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile "More" drawer */}
      {mobileMoreOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden" onClick={() => setMobileMoreOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">Mais opções</h3>
              <button onClick={() => setMobileMoreOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <X size={18} />
              </button>
            </div>
            <div className="p-3 space-y-1">
              {mobileMoreTabs.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.includes(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMoreOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                      isActive ? 'shadow-sm' : 'text-slate-600 active:bg-slate-50'
                    }`}
                    style={isActive ? {
                      backgroundColor: 'color-mix(in srgb, var(--primary-color), white 90%)',
                      color: 'var(--primary-color)',
                    } : {}}
                  >
                    <Icon size={20} style={isActive ? { color: 'var(--primary-color)' } : {}} />
                    <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            {/* User info + Logout */}
            <div className="p-3 pt-0 border-t border-slate-100 mt-1">
              <div className="flex items-center gap-3 px-4 py-3">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-inner overflow-hidden shrink-0"
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
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider truncate">
                    {currentUser?.role === 'admin' ? 'Administrador' : 'Colaborador'}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-red-600 bg-red-50 border border-red-100 font-bold text-sm active:bg-red-100 transition-colors"
              >
                <LogOut size={16} /> Sair da Conta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;