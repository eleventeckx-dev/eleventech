import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAgro } from '../../contexts/AgroContext';
import { CheckCircle2, LogOut, Lock, Camera } from 'lucide-react';
import { uploadImage } from '../../lib/storage';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const UserPerfil = () => {
  const { currentUser, setCurrentUser } = useAgro();
  const navigate = useNavigate();
  const { companySlug } = useParams<{ companySlug: string }>();
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = () => {
    const slug = companySlug;
    setCurrentUser(null);
    navigate(`/${slug}`);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !currentUser) return;
    
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const imageUrl = await uploadImage(file);
      
      const { error } = await supabase.from('profiles').update({ avatar: imageUrl }).eq('id', currentUser.id);
      if (error) throw error;
      
      // Atualiza o contexto localmente
      setCurrentUser({ ...currentUser, avatar: imageUrl });
      toast.success('Foto de perfil atualizada!');
    } catch (err: any) {
      console.error(err);
      toast.error('Falha ao atualizar foto. Verifique a conexão.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 pb-32">
      <div className="mb-8 text-center pt-8">
        <label className="relative w-28 h-28 bg-gradient-to-tr from-brand-soft to-white text-brand font-black text-4xl flex items-center justify-center rounded-full mx-auto mb-5 shadow-xl border-4 border-white cursor-pointer active:scale-95 transition-transform group overflow-hidden" style={{ boxShadow: '0 20px 40px rgba(var(--primary-rgb), 0.15)' }}>
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
          
          {isUploading ? (
            <div className="w-8 h-8 border-4 border-brand-soft border-t-brand rounded-full animate-spin"></div>
          ) : currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="Perfil" className="w-full h-full object-cover" />
          ) : (
            currentUser?.name.charAt(0)
          )}
          
          {/* Overlay de Câmera (Hover) */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white" size={28} />
          </div>
        </label>
        
        <h2 className="text-2xl font-black text-brand tracking-tight">{currentUser?.name}</h2>
        <p className="opacity-60 font-medium">{currentUser?.email}</p>
        <span className="inline-block mt-4 px-4 py-1.5 btn-brand rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
          {currentUser?.role === 'admin' ? 'Administrador' : 'Colaborador Operacional'}
        </span>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6">
        <h4 className="font-black text-brand mb-4 text-lg">Meu Acesso</h4>
        <div className="space-y-4">
          {[
            { label: 'Coleta na Roça', allowed: currentUser?.permissions?.canCollect },
            { label: 'Conferência no Barracão', allowed: currentUser?.permissions?.canProcess },
          ].map((perm, i) => (
            <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-sm font-bold opacity-80">{perm.label}</span>
              {perm.allowed ? (
                <div className="bg-brand-soft text-brand p-1.5 rounded-full"><CheckCircle2 size={16} strokeWidth={3} /></div>
              ) : (
                <div className="bg-slate-200 text-slate-400 p-1.5 rounded-full"><Lock size={14} strokeWidth={2.5} /></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 font-bold py-5 rounded-[2rem] flex items-center justify-center gap-2 hover:bg-red-100 active:scale-[0.98] transition-all">
        <LogOut size={20} strokeWidth={2.5} /> Encerrar Sessão
      </button>
    </div>
  );
};

export default UserPerfil;
