import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, Factory, DollarSign, CheckCircle, PackageSearch, Users, UsersRound, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAgro } from '../contexts/AgroContext';

const AdminLayout = () => {
  const location = useLocation();
  const { currentUser, setCurrentUser } = useAgro();

  const menu = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Cargas', path: '/app/cargas', icon: PackageSearch },
    { name: 'Coleta', path: '/app/coleta', icon: Truck },
    { name: 'Beneficiamento', path: '/app/beneficiamento', icon: Factory },
    { name: 'Financeiro', path: '/app/financeiro', icon: DollarSign },
    { name: 'Pagamentos', path: '/app/pagamentos', icon: CheckCircle },
    { name: 'Produtores', path: '/app/produtores', icon: Users },
    { name: 'Colaboradores', path: '/app/colaboradores', icon: UsersRound },
    { name: 'Relatórios', path: '/app/relatorios', icon: BarChart3 },
    { name: 'Configurações', path: '/app/configuracoes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-xl font-bold text-emerald-700 tracking-tight flex items-center gap-2">
            🌱 AgroFlow <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full ml-1">ADMIN</span>
          </span>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Gestão da Operação</p>
          <div className="space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.includes(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 truncate">Empresa: AgroSul</p>
            </div>
          </div>
          <button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={18} /> <span className="text-sm font-medium">Sair do Sistema</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-semibold text-gray-800 capitalize">
            {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
             <div className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
               Ambiente Simulado
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;