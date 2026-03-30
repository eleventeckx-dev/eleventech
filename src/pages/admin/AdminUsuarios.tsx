import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAgro } from '../../contexts/AgroContext';
import { User, UserRole } from '../../types';
import { 
  UserPlus, Edit2, Trash2, CheckCircle2, XCircle, 
  ShieldCheck, Shield, AlertTriangle, Share2, Copy, Check, Link as LinkIcon, Smartphone 
} from 'lucide-react';
import { toast } from 'sonner';

const AdminUsuarios = () => {
  const { users, currentUser, companies, addUser, updateUser, deleteUser } = useAgro();
  const { companySlug } = useParams<{ companySlug: string }>();
  
  // Filtra apenas os usuários da mesma empresa (esconde Maestros)
  const companyUsers = users.filter(u => u.companyId === currentUser?.companyId && u.role !== 'maestro');
  const company = companies.find(c => c.id === currentUser?.companyId);

  const [copiedLink, setCopiedLink] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'collaborator' as UserRole,
    permissions: {
      canCollect: false,
      canProcess: false,
      canManageFinancial: false,
      canMarkPayment: false,
      canViewReports: false,
    }
  });

  const openAddModal = () => {
    setEditingId(null);
    setForm({ 
      name: '', email: '', password: '', role: 'collaborator',
      permissions: { canCollect: false, canProcess: false, canManageFinancial: false, canMarkPayment: false, canViewReports: false }
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      permissions: user.permissions || { canCollect: false, canProcess: false, canManageFinancial: false, canMarkPayment: false, canViewReports: false }
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingId && !form.password) {
      toast.error('Informe uma senha inicial para o novo usuário.');
      return;
    }
    if (form.password && form.password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    const permissionsData = form.role === 'collaborator' ? {
      id: `perm_${Date.now()}`,
      companyId: currentUser?.companyId || '',
      userId: editingId || `usr_${Date.now()}`,
      ...form.permissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } : undefined;

    try {
      if (editingId) {
        await updateUser(editingId, { 
          name: form.name, 
          email: form.email, 
          role: form.role,
          permissions: permissionsData as any
        }, form.password ? form.password : undefined);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        const newUser: User = {
          id: `usr_${Date.now()}`,
          companyId: currentUser?.companyId,
          name: form.name,
          email: form.email,
          role: form.role,
          status: 'active',
          permissions: permissionsData as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as User;
        await addUser(newUser, form.password);
        toast.success('Usuário criado com sucesso!');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Falha na operação técnica.');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string | undefined) => {
    try {
      await updateUser(id, { status: currentStatus === 'active' ? 'inactive' : 'active' });
      toast.info('Status atualizado.');
    } catch (err: any) {
      toast.error('Falha ao atualizar status');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja inativar/excluir este acesso da plataforma?')) {
      try {
        await deleteUser(id);
        toast.success('Usuário inativado.');
      } catch (err: any) {
        toast.error('Falha ao inativar acesso.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Usuários</h2>
          <p className="text-sm text-slate-500 mt-1">Controle de acessos e permissões da equipe.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20"
        >
          <UserPlus size={20} /> Novo Usuário
        </button>
      </div>

      {/* Card de Compartilhamento */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Share2 size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-white mb-1">Link de Acesso da Equipe</h3>
            <p className="text-xs text-slate-400 mb-3">Compartilhe este link com seus colaboradores para que acessem o sistema.</p>
            
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 mb-3">
              <LinkIcon size={14} className="text-slate-500 shrink-0" />
              <code className="text-xs text-emerald-400 font-mono truncate flex-1">
                {window.location.origin}/{companySlug || company?.slug}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/${companySlug || company?.slug}`);
                  setCopiedLink(true);
                  toast.success('Link copiado para a área de transferência!');
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className={`p-1.5 rounded-lg transition-all shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                title="Copiar link"
              >
                {copiedLink ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>

            <div className="flex gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Olá! 👋\n\nVocê foi convidado para acessar o sistema ${company?.name || 'ElevenTech'}.\n\n📲 Acesse pelo link:\n${window.location.origin}/${companySlug || company?.slug}\n\nUse o e-mail e senha que foram cadastrados para você.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
              >
                <Smartphone size={14} /> Enviar via WhatsApp
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Olá! 👋\n\nVocê foi convidado para acessar o sistema ${company?.name || 'ElevenTech'}.\n\n📲 Acesse pelo link:\n${window.location.origin}/${companySlug || company?.slug}\n\nUse o e-mail e senha que foram cadastrados para você.`
                  );
                  toast.success('Mensagem de convite copiada!');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-600"
              >
                <Copy size={14} /> Copiar Mensagem
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Usuário</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Perfil de Acesso</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companyUsers.map(user => (
              <tr key={user.id} className={`hover:bg-slate-50/50 transition ${user.status === 'inactive' ? 'opacity-60' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200 overflow-hidden shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                      <ShieldCheck size={14} /> Administrador
                    </span>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 w-fit">
                        <Shield size={14} /> Colaborador
                      </span>
                      {user.permissions && (
                        <div className="text-[10px] text-slate-500 mt-1 flex gap-1 flex-wrap max-w-[200px]">
                          {user.permissions.canCollect && <span className="bg-slate-100 px-1.5 py-0.5 rounded">Coleta</span>}
                          {user.permissions.canProcess && <span className="bg-slate-100 px-1.5 py-0.5 rounded">Benefic.</span>}
                          {user.permissions.canManageFinancial && <span className="bg-slate-100 px-1.5 py-0.5 rounded">Financ.</span>}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {user.status === 'active' ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                      <CheckCircle2 size={16} /> Ativo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400 text-sm font-semibold">
                      <XCircle size={16} /> Inativo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => toggleStatus(user.id, user.status)}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title={user.status === 'active' ? 'Inativar' : 'Ativar'}
                    >
                      {user.status === 'active' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {companyUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 overflow-y-auto flex items-start justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[95vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {editingId ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
                  <input required type="text" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: João Silva" />
                </div>
                
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">E-mail de Acesso</label>
                  <input required type="email" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="joao@empresa.com" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Senha de Acesso {editingId && <span className="text-slate-400 font-normal ml-1">(opcional)</span>}</label>
                  <input required={!editingId} type="text" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editingId ? "Deixe vazio para manter a mesma" : "Mínimo 6 caracteres"} />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Perfil de Acesso</label>
                  <select 
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                    value={form.role} 
                    onChange={e => setForm({...form, role: e.target.value as UserRole})}
                  >
                    <option value="collaborator">Colaborador (App/Operação)</option>
                    <option value="admin">Administrador (Acesso Total)</option>
                  </select>
                </div>
              </div>

              {/* Permissões Específicas para Colaboradores */}
              {form.role === 'collaborator' && (
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-slate-800 mb-3">Permissões de Acesso (Quais etapas ele pode editar?)</p>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { key: 'canCollect', label: 'Pode Registrar Nova Coleta' },
                      { key: 'canProcess', label: 'Pode Fazer Beneficiamento' },
                      { key: 'canManageFinancial', label: 'Pode Fechar o Financeiro' },
                    ].map(perm => (
                      <label key={perm.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                          checked={form.permissions[perm.key as keyof typeof form.permissions]}
                          onChange={(e) => setForm({
                            ...form, 
                            permissions: { ...form.permissions, [perm.key]: e.target.checked }
                          })}
                        />
                        <span className="text-sm font-medium text-slate-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-3 ml-1 bg-white p-2 rounded-lg border border-slate-100">
                    * O usuário conseguirá visualizar a lista de todas as etapas, mas os botões de ação estarão bloqueados onde ele não tiver permissão.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30">
                  {editingId ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;