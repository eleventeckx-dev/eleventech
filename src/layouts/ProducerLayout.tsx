import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAgro } from '../contexts/AgroContext';
import { LogOut, Tractor } from 'lucide-react';

const ProducerLayout = () => {
  const { currentUser, setCurrentUser } = useAgro();
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <Tractor size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Painel do Produtor</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Acompanhamento de Cargas</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-800">{currentUser?.name}</p>
                <p className="text-xs text-slate-500">{currentUser?.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-10 h-10 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-full flex items-center justify-center transition-colors border border-slate-200 hover:border-red-200"
                title="Sair"
              >
                <LogOut size={18} strokeWidth={2.5} />
              </button>
            </div>

          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ProducerLayout;