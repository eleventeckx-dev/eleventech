import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgro } from '../contexts/AgroContext';
import { MOCK_USERS } from '../data/mock';
import { ShieldCheck, LogIn, Mail, Lock, Crown, Building2, User } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const { setCurrentUser } = useAgro();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const performLogin = (targetEmail: string, targetPass: string) => {
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());
    
    if (user && targetPass === '123456') {
      setCurrentUser(user);
      toast.success(`Bem-vindo, ${user.name}!`);
      
      // Redirecionamento Baseado no Perfil
      if (user.role === 'super_admin') {
        navigate('/super-admin/dashboard');
      } else if (user.role === 'admin') {
        navigate('/app/dashboard');
      } else if (user.role === 'collaborator') {
        // App Operacional Unificado para todos os colaboradores
        navigate('/user'); 
      }
    } else {
      toast.error('E-mail ou senha incorretos.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const quickAccess = [
    { name: 'Super Admin', email: 'sadmin@agro.com', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
    { name: 'Gestor (Admin)', email: 'carlos@agrosul.com', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
    { name: 'Colaborador (João)', email: 'joao@agrosul.com', icon: User, color: 'text-emerald-600', bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200' },
    { name: 'Colaborador (Maria)', email: 'maria@agrosul.com', icon: User, color: 'text-amber-600', bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white mb-4 shadow-lg shadow-emerald-500/30">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AgroFlow</h1>
          <p className="text-slate-500 mt-2">Acesse sua conta para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 ml-1">E-mail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ex: sadmin@agro.com" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 ml-1">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Senha: 123456" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <LogIn size={20} /> Entrar no Sistema
          </button>
        </form>

        <div className="mt-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acesso Rápido (Testes)</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {quickAccess.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => performLogin(item.email, '123456')}
                  type="button"
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all active:scale-95 ${item.bg}`}
                >
                  <Icon size={20} className={`mb-1.5 ${item.color}`} />
                  <span className="text-xs font-bold text-slate-700">{item.name}</span>
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;