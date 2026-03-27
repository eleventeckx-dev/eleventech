import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgro } from '../contexts/AgroContext';
import { MOCK_USERS } from '../data/mock';
import { ShieldCheck, Building2, UserCircle, ArrowRight } from 'lucide-react';

const RoleSelector = () => {
  const { setCurrentUser } = useAgro();
  const navigate = useNavigate();

  const handleLogin = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'super_admin') navigate('/super-admin/dashboard');
      if (user.role === 'admin') navigate('/app/dashboard');
      if (user.role === 'collaborator') navigate('/workspace/home');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white mb-4 shadow-lg shadow-emerald-500/30">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Bem-vindo ao AgroFlow</h1>
          <p className="text-lg text-slate-500 mt-2">SaaS para Gestão Operacional de Cargas Agrícolas</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Modo de Demonstração (Sem Banco de Dados)
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Super Admin */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform cursor-pointer group" onClick={() => handleLogin('usr_sa1')}>
             <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
               <ShieldCheck size={28} />
             </div>
             <h2 className="text-xl font-bold text-slate-900 mb-2">Plataforma (SaaS)</h2>
             <p className="text-slate-500 text-sm mb-6 flex-1">Acesso exclusivo do dono do software. Gestão de empresas, planos e faturamento SaaS.</p>
             <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition">
               Entrar como Super Admin <ArrowRight size={18} />
             </button>
          </div>

          {/* Admin */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-emerald-200/20 border border-emerald-50 flex flex-col items-center text-center hover:-translate-y-1 transition-transform cursor-pointer group relative overflow-hidden" onClick={() => handleLogin('usr_a1')}>
             <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500"></div>
             <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
               <Building2 size={28} />
             </div>
             <h2 className="text-xl font-bold text-slate-900 mb-2">Empresa (AgroSul)</h2>
             <p className="text-slate-500 text-sm mb-6 flex-1">Visão do cliente do SaaS. Gestão completa da operação, dashboard gerencial e relatórios.</p>
             <button className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition">
               Entrar como Admin <ArrowRight size={18} />
             </button>
          </div>

          {/* Collaborator */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-200/20 border border-blue-50 flex flex-col items-center text-center hover:-translate-y-1 transition-transform cursor-pointer group" onClick={() => handleLogin('usr_c1')}>
             <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
               <UserCircle size={28} />
             </div>
             <h2 className="text-xl font-bold text-slate-900 mb-2">Colaborador (Operação)</h2>
             <p className="text-slate-500 text-sm mb-6 flex-1">App mobile-first para quem está em campo. Lançamento de coletas e beneficiamento.</p>
             <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition">
               Acessar App <ArrowRight size={18} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;