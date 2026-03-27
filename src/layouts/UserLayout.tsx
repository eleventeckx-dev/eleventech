import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Truck, Factory, DollarSign, User } from 'lucide-react';
import { useAgro } from '../contexts/AgroContext';

const UserLayout = () => {
  const location = useLocation();
  const { currentUser } = useAgro();

  const permissions = currentUser?.permissions;

  // As 4 etapas restritas do aplicativo
  const menu = [
    { name: 'Coleta', path: '/user/coleta', icon: Truck, show: permissions?.canCollect },
    { name: 'Beneficiamento', path: '/user/beneficiamento', icon: Factory, show: permissions?.canProcess },
    { name: 'Financeiro', path: '/user/financeiro', icon: DollarSign, show: permissions?.canManageFinancial },
    { name: 'Perfil', path: '/user/perfil', icon: User, show: true }, // Perfil sempre visível
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile App Header Minimalista */}
      <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold">
              🌱
            </div>
            <span className="text-lg font-bold tracking-tight">AgroFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center font-bold border border-emerald-600 shadow-sm">
              {currentUser?.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Mobile Optimized */}
      <main className="flex-1 w-full max-w-lg mx-auto bg-gray-50 relative flex flex-col sm:border-x sm:border-gray-200">
        <div className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </div>
        
        {/* Bottom Navigation Exclusiva (Sem Menu Lateral) */}
        <div className="fixed sm:absolute bottom-0 left-0 right-0 sm:left-auto sm:right-auto sm:w-full bg-white border-t border-gray-200 flex justify-around items-center h-[72px] pb-safe z-10 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {menu.map((item) => {
             const Icon = item.icon;
             const isActive = location.pathname.includes(item.path);
             return (
               <Link 
                 key={item.path} 
                 to={item.path} 
                 className="flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-colors group relative"
               >
                 {isActive && (
                   <span className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-b-full"></span>
                 )}
                 <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-600'}`}>
                   <Icon size={22} className={isActive ? 'fill-emerald-100/50' : ''} />
                 </div>
                 <span className={`text-[10px] font-bold truncate w-full text-center ${isActive ? 'text-emerald-700' : 'text-gray-400'}`}>
                   {item.name}
                 </span>
               </Link>
             )
          })}
        </div>
      </main>
    </div>
  );
};

export default UserLayout;