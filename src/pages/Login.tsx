import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgro } from '../contexts/AgroContext';
import { MOCK_USERS } from '../data/mock';
import { ShieldCheck, LogIn, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const { setCurrentUser } = useAgro();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simula a busca do usuário no mock de banco de dados
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Todos os usuários de teste usam a senha 123456
    if (user && password === '123456') {
      setCurrentUser(user);
      toast.success(`Bem-vindo, ${user.name}!`);
      
      // Redirecionamento Inteligente baseado na Role
      if (user.role === 'super_admin') navigate('/super-admin/dashboard');
      if (user.role === 'admin') navigate('/app/dashboard');
      if (user.role === 'collaborator') navigate('/user/coleta'); // Direcionamento direto para a aba de coleta do user
    } else {
      toast.error('E-mail ou senha incorretos.');
    }
  };

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

        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs text-blue-800 font-semibold uppercase mb-2">Contas de Teste (Senha: 123456)</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li><span className="font-bold">Super Admin:</span> sadmin@agro.com</li>
            <li><span className="font-bold">Admin Empresa:</span> carlos@agrosul.com</li>
            <li><span className="font-bold">App Colaborador:</span> joao@agrosul.com</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Login;