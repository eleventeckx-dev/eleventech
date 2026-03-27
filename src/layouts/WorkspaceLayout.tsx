import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Truck, Factory, DollarSign, CheckCircle, PackageSearch, Menu, X, LogOut } from 'lucide-react';
import { useAgro } from '../contexts/AgroContext';

const WorkspaceLayout = () => {
  const location = useLocation();
  const { currentUser, setCurrentUser } = useAgro();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const permissions = currentUser?.permissions;

  // Menu Dinâmico baseado em Permissões
  const menu = [
    { name: 'Início', path: '/workspace/home', icon: Home, show: true },
    { name: 'Nova Coleta', path: '/workspace/coleta', icon: Truck, show: permissions?.canCollect },
    { name: 'Beneficiamento', path: '/workspace/beneficiamento', icon: Factory, show: permissions?.canProcess },
    { name: 'Financeiro', path: '/workspace/financeiro', icon: DollarSign, show: permissions?.canManageFinancial },
    { name: 'Pagamentos', path: '/workspace/pagamentos', icon: CheckCircle, show: permissions?.canMarkPayment },
    { name: 'Minhas Cargas', path: '/workspace/minhas-cargas', icon: PackageSearch, show: true },
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Mobile App Header */}
      <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 -ml-2 rounded-lg hover:bg-emerald-600 transition">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="text-lg font-bold tracking-tight">AgroFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{currentUser?.name}</p>
              <p className="text-xs text-emerald-200">Operação</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center font-bold border border-emerald-600">
              {currentUser?.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-20 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)}></div>
          <nav className="relative w-64 bg-white h-full shadow-xl flex flex-col animate-in slide-in-from-left-full duration-200">
            <div className="p-4 bg-emerald-50 border-b border-emerald-100">
               <p className="font-semibold text-emerald-800">{currentUser?.name}</p>
               <p className="text-xs text-emerald-600 mt-1">Colaborador AgroSul</p>
            </div>
            <div className="p-2 flex-1 overflow-y-auto space-y-1 mt-2">
              {menu.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.includes(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive ? 'bg-emerald-100 text-emerald-800 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-emerald-700' : 'text-gray-400'} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-100">
               <button onClick={() => setCurrentUser(null)} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition">
                 <LogOut size={20} /> Sair
               </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Area - Mobile Optimized */}
      <main className="flex-1 w-full max-w-lg mx-auto bg-gray-50 shadow-2xl relative flex flex-col sm:border-x sm:border-gray-200">
        <div className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </div>
        
        {/* Bottom Navigation for quick access */}
        <div className="fixed sm:absolute bottom-0 left-0 right-0 sm:left-auto sm:right-auto sm:w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 pb-safe z-10 px-2">
          {menu.slice(0, 4).map((item) => {
             const Icon = item.icon;
             const isActive = location.pathname.includes(item.path);
             return (
               <Link key={item.path} to={item.path} className={`flex flex-col items-center justify-center w-16 h-full gap-1 ${isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
                 <Icon size={20} className={isActive ? 'fill-emerald-100' : ''} />
                 <span className="text-[10px] font-medium truncate w-full text-center">{item.name.split(' ')[0]}</span>
               </Link>
             )
          })}
        </div>
      </main>
    </div>
  );
};

export default WorkspaceLayout;