import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, CreditCard, Puzzle, ShieldCheck, Settings, LogOut } from 'lucide-react';
import { useAgro } from '../contexts/AgroContext';

const SuperAdminLayout = () => {
  const location = useLocation();
  const { currentUser, setCurrentUser } = useAgro();

  const menu = [
    { name: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
    { name: 'Empresas', path: '/super-admin/companies', icon: Building2 },
    { name: 'Admins', path: '/super-admin/admins', icon: Users },
    { name: 'Planos', path: '/super-admin/plans', icon: CreditCard },
    { name: 'Módulos', path: '/super-admin/modules', icon: Puzzle },
    { name: 'Auditoria', path: '/super-admin/audit', icon: ShieldCheck },
    { name: 'Configurações', path: '/super-admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar SaaS */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" /> AgroFlow <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded ml-2">PLATAFORMA</span>
          </span>
        </div>
        <div className="p-4 flex-1">
          <div className="space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.includes(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <LogOut size={18} /> <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm z-10">
          <h1 className="text-lg font-semibold text-slate-800 capitalize">
            {location.pathname.split('/').pop() || 'Dashboard'}
          </h1>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;