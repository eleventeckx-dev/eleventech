import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Truck, Factory, DollarSign, User, Leaf, LogOut } from 'lucide-react';
import { useAgro } from '../contexts/AgroContext';

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAgro();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const menu = [
    { name: 'Coleta', path: '/user/coleta', icon: Truck },
    { name: 'Benefic.', path: '/user/beneficiamento', icon: Factory },
    { name: 'Financ.', path: '/user/financeiro', icon: DollarSign },
    { name: 'Perfil', path: '/user/perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-200">
      
      {/* Mobile App Header - Premium Glassmorphism */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] transition-all">
        <div className="max-w-md mx-auto w-full flex items-center justify-between px-6 h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Leaf size={20} className="text-white fill-white/20" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-800 tracking-tight leading-none block">AgroFlow</span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Operação</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleLogout}
              title="Sair da conta"
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all"
            >
              <LogOut size={20} strokeWidth={2.5} />
            </button>
            <div className="relative group cursor-pointer">
              <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 border-2 border-white shadow-sm transition-transform active:scale-95">
                {currentUser?.name.charAt(0) || '?'}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto bg-slate-50 relative flex flex-col">
        <div className="flex-1 overflow-y-auto pb-32 pt-4 px-2">
          <Outlet />
        </div>
        
        {/* Floating Bottom Navigation (Premium Pill) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[400px] z-40">
          <div className="bg-white/90 backdrop-blur-2xl border border-white/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-3xl flex justify-around items-center h-20 px-2">
            {menu.map((item) => {
               const Icon = item.icon;
               const isActive = location.pathname.includes(item.path);
               return (
                 <Link 
                   key={item.path} 
                   to={item.path} 
                   className="flex flex-col items-center justify-center w-16 h-full gap-1.5 transition-all group relative"
                 >
                   <div className={`relative p-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-110 -translate-y-1' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                     <Icon size={22} className={isActive ? 'fill-white/20' : ''} strokeWidth={isActive ? 2.5 : 2} />
                   </div>
                   <span className={`text-[10px] font-bold truncate w-full text-center transition-colors duration-300 ${isActive ? 'text-emerald-700 opacity-100' : 'text-slate-400 opacity-80'}`}>
                     {item.name}
                   </span>
                 </Link>
               )
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserLayout;