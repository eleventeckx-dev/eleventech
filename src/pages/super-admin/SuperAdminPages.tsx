import React, { useState } from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Building2, Plus, CheckCircle2, XCircle, Edit2, Users2, Phone, MessageSquare, Clock, Filter, Link as LinkIcon, Copy, Check, Trash2, RefreshCcw, AlertOctagon } from 'lucide-react';
import { toast } from 'sonner';

// ---- DASHBOARD SUPER ADMIN ----
export const SADashboard = () => {
  const { companies } = useAgro();
  
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const inactiveCompanies = companies.length - activeCompanies;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Visão Geral da Plataforma</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total de Empresas</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{companies.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Empresas Ativas</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{activeCompanies}</h3>
              <p className="text-xs text-slate-400 mt-1">{inactiveCompanies} inativas</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- GESTÃO DE EMPRESAS ----
export const SACompanies = () => {
  const { companies, users, addCompany, updateCompany, resetCompanyData, deleteCompanyFull } = useAgro();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', document: '', adminName: '', adminEmail: '', adminPassword: '' });
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; action: 'reset' | 'delete' | null; companyId: string | null }>({ isOpen: false, action: null, companyId: null });
  const [maestroPass, setMaestroPass] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getCompanyLink = (slug: string) => {
    const base = window.location.origin;
    return `${base}/${slug}/app/dashboard`;
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(getCompanyLink(slug));
    setCopiedSlug(slug);
    toast.success('Link copiado!');
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ name: '', document: '', adminName: '', adminEmail: '', adminPassword: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (company: { id: string; name: string; document: string }) => {
    setEditingId(company.id);
    
    // Buscar o admin dessa empresa no banco (contexto)
    const companyAdmin = users.find(u => u.companyId === company.id && u.role === 'admin');
    
    setForm({ 
      name: company.name, 
      document: company.document, 
      adminName: companyAdmin?.name || '', 
      adminEmail: companyAdmin?.email || '',
      adminPassword: (companyAdmin as any)?.password || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateCompany(editingId, { name: form.name, document: form.document }, form.adminName, form.adminEmail, form.adminPassword);
        toast.success('Dados da empresa e admin atualizados!');
      } else {
        const newCompany = {
          id: crypto.randomUUID(),
          name: form.name,
          document: form.document,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        // Passamos os dados do admin como argumentos extras (Incluindo Senha para a Edge Function)
        await addCompany(newCompany, form.adminName, form.adminEmail, form.adminPassword);
        toast.success('Empresa e Acesso do Gestor criados!');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Erro ao salvar empresa:', error.message);
      toast.error('Erro ao salvar empresa. Verifique as permissões.');
    }
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    updateCompany(id, { status: currentStatus === 'active' ? 'inactive' : 'active' });
    toast.info('Status da empresa atualizado.');
  };

  const handleCriticalAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModal.companyId || !passwordModal.action || !maestroPass) return;
    
    try {
      setIsProcessing(true);
      if (passwordModal.action === 'reset') {
        await resetCompanyData(passwordModal.companyId, maestroPass);
        toast.success("Dados da empresa apagados com sucesso. A empresa continua existindo como uma folha em branco.");
      } else {
        await deleteCompanyFull(passwordModal.companyId, maestroPass);
        toast.success("Empresa totalmente excluída, incluindo todos os seus usuários.");
      }
      setPasswordModal({ isOpen: false, action: null, companyId: null });
      setMaestroPass('');
    } catch(err: any) {
      toast.error(err.message || 'Falha ao executar ação crítica.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Empresas Clientes</h2>
        <button 
          onClick={openAddModal}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-emerald-700 transition"
        >
          <Plus size={20} /> Nova Empresa
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Empresa</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">CNPJ</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Link de Acesso</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.map(company => (
              <tr key={company.id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-900">{company.name}</p>
                  <p className="text-xs text-slate-500">ID: {company.id}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{company.document || '—'}</td>
                <td className="px-6 py-4">
                  {company.slug ? (
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-mono truncate max-w-[180px]" title={getCompanyLink(company.slug)}>
                        /{company.slug}/app
                      </code>
                      <button
                        onClick={() => copyLink(company.slug)}
                        className={`p-1.5 rounded-lg transition-all ${
                          copiedSlug === company.slug
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Copiar link de acesso"
                      >
                        {copiedSlug === company.slug ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Sem slug</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {company.status === 'active' ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                      <CheckCircle2 size={16} /> Ativa
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
                      <XCircle size={16} /> Inativa
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openEditModal(company)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar Empresa"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => toggleStatus(company.id, company.status)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                        company.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {company.status === 'active' ? 'Desativar' : 'Ativar'}
                    </button>
                    
                    <button
                      onClick={() => setPasswordModal({ isOpen: true, action: 'reset', companyId: company.id })}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition ml-2"
                      title="Resetar Banco de Dados da Empresa"
                    >
                      <RefreshCcw size={16} />
                    </button>
                    <button
                      onClick={() => setPasswordModal({ isOpen: true, action: 'delete', companyId: company.id })}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Excluir Empresa Definitivamente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Formulário de Empresa (Criar/Editar) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {editingId ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Nome da Empresa</label>
                <input 
                  required 
                  type="text" 
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">CNPJ</label>
                <input 
                  required 
                  type="text" 
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={form.document} 
                  onChange={e => setForm({...form, document: e.target.value})} 
                placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {editingId ? 'Gerenciar Gestor da Empresa' : 'Acesso do Gestor Inicial'}
                </p>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Nome do Gestor</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none" 
                    value={form.adminName} 
                    onChange={e => setForm({...form, adminName: e.target.value})} 
                    placeholder="Nome completo"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">E-mail (Login)</label>
                    <input 
                      required 
                      type="email" 
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none" 
                      value={form.adminEmail} 
                      onChange={e => setForm({...form, adminEmail: e.target.value})} 
                      placeholder="gestor@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Senha de Acesso</label>
                    <input 
                      required={!editingId} 
                      type="text" 
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none" 
                      value={form.adminPassword} 
                      onChange={e => setForm({...form, adminPassword: e.target.value})} 
                      placeholder={editingId ? "Deixe em branco para manter" : "Mín. 6 caracteres"}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30">
                  {editingId ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Validação de Senha do Maestro para Ações Críticas */}
      {passwordModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${passwordModal.action === 'delete' ? 'bg-red-500' : 'bg-amber-500'}`} />
            
            <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${passwordModal.action === 'delete' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
              <AlertOctagon size={28} />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Ação Irreversível</h3>
            <p className="text-sm text-slate-500 mb-6 px-2">
              {passwordModal.action === 'delete' 
                ? 'Isso excluirá permanentemente a empresa e TODOS os usuários vinculados.' 
                : 'Isso apagará todas as cargas, produtores e produtos inseridos (reset completo), mas manterá a empresa e as configurações.'}
            </p>
            
            <form onSubmit={handleCriticalAction}>
              <div className="text-left mb-6">
                <label className="text-sm font-black text-slate-700 block mb-1 uppercase tracking-wider">Senha do Super Admin</label>
                <input 
                  required 
                  type="password" 
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none text-center tracking-[0.2em]" 
                  value={maestroPass} 
                  onChange={e => setMaestroPass(e.target.value)} 
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => { setPasswordModal({ isOpen: false, action: null, companyId: null }); setMaestroPass(''); }} 
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-bold transition shadow-lg flex justify-center items-center gap-2 ${
                    passwordModal.action === 'delete' 
                      ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' 
                      : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/30'
                  }`}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- GESTÃO DE LEADS (MKT/SALES) ----
export const SALeads = () => {
  const { leads, updateLeadStatus } = useAgro();
  const [filter, setFilter] = useState('');

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(filter.toLowerCase()) || 
    l.email?.toLowerCase().includes(filter.toLowerCase()) ||
    l.phone?.includes(filter)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-tight">Novo</span>;
      case 'contacted': return <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-tight">Em Contato</span>;
      case 'converted': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-tight">Convertido</span>;
      default: return null;
    }
  };

  const notifyMaestro = (id: string, status: any) => {
    updateLeadStatus(id, status);
    toast.success('Status do Lead Atualizado!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Pipeline de Vendas</h2>
          <p className="text-sm text-slate-500 font-medium">Contatos recebidos pela Landing Page da ElevenTech</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden px-3 items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar interessado..." 
              className="py-2.5 outline-none text-sm text-slate-600 bg-transparent w-48"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
          <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Novos Leads</p>
          <h3 className="text-3xl font-black text-blue-900">{leads.filter(l => l.status === 'new').length}</h3>
        </div>
        <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
          <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">Em Negociação</p>
          <h3 className="text-3xl font-black text-amber-900">{leads.filter(l => l.status === 'contacted').length}</h3>
        </div>
        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Conversões</p>
          <h3 className="text-3xl font-black text-emerald-900">{leads.filter(l => l.status === 'converted').length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Interessado</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Operação</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Maior Dor</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.length > 0 ? filteredLeads.map(lead => (
              <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{lead.name}</p>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                          <Phone size={10} /> {lead.phone}
                        </p>
                        {lead.email && (
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Filter size={10} /> {lead.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                    {lead.operationSize} cargas/dia
                  </span>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm text-slate-700 max-w-xs truncate italic">"{lead.painPoint || 'Não informado'}"</p>
                </td>
                <td className="px-6 py-5">
                  {getStatusBadge(lead.status)}
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => notifyMaestro(lead.id, 'contacted')}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      title="Marcar como Em Contato"
                    >
                      <MessageSquare size={18} />
                    </button>
                    <button 
                      onClick={() => notifyMaestro(lead.id, 'converted')}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      title="Converter em Cliente"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <a 
                      href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} 
                      target="_blank"
                      className="p-2 text-agro-grass hover:bg-agro-grass/10 rounded-xl transition-all"
                      title="Chamar no WhatsApp"
                    >
                      <Phone size={18} />
                    </a>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users2 size={32} />
                  </div>
                  <p className="font-bold">Nenhum lead encontrado.</p>
                  <p className="text-sm">Inicie uma campanha de tráfego para a Landing Page!</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};