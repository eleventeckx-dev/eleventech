import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAgro } from '../contexts/AgroContext';
import { supabase } from '../lib/supabase';
import { ShieldCheck, LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const { currentUser, companies, setBrandingSlug } = useAgro();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Empresa para o branding visual na tela de login
  const brandingCompany = companies.find(c => c.slug === (slug?.toLowerCase()));

  // Efeito para ativar o branding via URL
  useEffect(() => {
    if (slug) {
      setBrandingSlug(slug);
    }
    return () => setBrandingSlug(null);
  }, [slug, setBrandingSlug]);

  // Redirecionamento automático se já estiver logado
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'maestro') navigate('/super-admin/dashboard');
      else if (currentUser.role === 'admin') navigate('/app/dashboard');
      else if (currentUser.role === 'collaborator') {
        if (currentUser.permissions?.canManageFinancial) {
          navigate('/app/financeiro');
        } else {
          navigate('/user');
        }
      }
      else if (currentUser.role === 'producer') navigate('/producer/dashboard');
      else {
        console.warn('Papel de usuário não mapeado para redirecionamento:', currentUser.role);
        toast.error(`Acesso restrito: O seu nível de acesso (${currentUser.role}) não possui uma área de trabalho definida.`);
        setLoading(false);
      }
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Se não houver erro, o AgroProvider detectará a sessão 
      // e o useEffect redirecionará o usuário automaticamente.
      // NÃO desligamos o loading aqui para evitar o "flash" do botão antes de mudar de página.
    } catch (error: any) {
      console.error('Erro no login:', error.message);
      toast.error(error.message === 'Invalid login credentials' 
        ? 'E-mail ou senha incorretos.' 
        : 'Ocorreu um erro ao tentar acessar a conta.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
        
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 mt-2 shadow-xl overflow-hidden bg-white border-4 border-white ring-4 ring-slate-100/50"
            style={{ 
              boxShadow: brandingCompany 
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
                : '0 20px 25px -5px var(--primary-color), 0 10px 10px -5px var(--primary-color)' 
            }}
          >
            {brandingCompany?.logo ? (
              <img src={brandingCompany.logo} alt={brandingCompany.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand flex items-center justify-center">
                <ShieldCheck size={48} className="text-white" />
              </div>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {brandingCompany?.name || 'Eleven Tech'}
          </h1>
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
                placeholder="seu@email.com" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 ring-brand focus:bg-white transition disabled:opacity-50"
                disabled={loading}
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
                placeholder="••••••••" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 ring-brand focus:bg-white transition disabled:opacity-50"
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
            style={{ 
              background: 'var(--gradient-bg)',
              boxShadow: '0 10px 20px -10px var(--primary-color)'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <LogIn size={20} /> Entrar no Sistema
              </>
            )}
          </button>
        </form>

        {/* Atalhos Rápidos para Teste */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 text-center uppercase tracking-wider mb-4">Acessos Rápidos (Teste)</p>
          <div className="grid grid-cols-1 gap-2">
            <button 
              type="button" 
              onClick={() => { setEmail('sadmin@eleventech.com'); setPassword('123456'); }}
              className="text-sm bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-600 font-medium py-2 rounded-lg transition-all"
            >
              🚀 Mestre: sadmin@eleventech.com
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('admin@ent.com'); setPassword('123456'); }}
              className="text-sm bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 text-indigo-700 font-medium py-2 rounded-lg transition-all"
            >
              🏢 Empresa: admin@ent.com
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('israel@ent.com'); setPassword('123456'); }}
              className="text-sm bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 text-emerald-700 font-medium py-2 rounded-lg transition-all"
            >
              👤 Colab (App): israel@ent.com
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('financeiro@ent.com'); setPassword('123456'); }}
              className="text-sm bg-amber-50 border border-amber-100 hover:bg-amber-100 hover:border-amber-200 text-amber-700 font-medium py-2 rounded-lg transition-all"
            >
              💰 Colab (Fin): financeiro@ent.com
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('produtor@ent.com'); setPassword('123456'); }}
              className="text-sm bg-orange-50 border border-orange-100 hover:bg-orange-100 hover:border-orange-200 text-orange-700 font-medium py-2 rounded-lg transition-all"
            >
              🚜 Produtor: produtor@ent.com
            </button>
          </div>
        </div>

        <div className="mt-8 text-center px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl font-black text-brand tracking-tight leading-none block">
              {brandingCompany?.name || 'Eleven Tech'}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium tracking-tight">
            © 2026 ElevenTech | Gestão Inteligente
          </span>
        </div>

      </div>
    </div>
  );
};

export default Login;