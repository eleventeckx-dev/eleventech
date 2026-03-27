import React, { useState } from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Building2, TrendingUp, Users, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// ---- DASHBOARD SUPER ADMIN ----
export const SADashboard = () => {
  const { companies } = useAgro();
  
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  // Simulação de MRR baseado em planos
  const mrr = companies.reduce((acc, c) => acc + (c.plan === 'Enterprise' ? 1500 : 500), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Visão Geral da Plataforma</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Receita Recorrente (MRR)</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mrr)}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- GESTÃO DE EMPRESAS ----
export const SACompanies = () => {
  const { companies, addCompany, updateCompany } = useAgro();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', document: '', plan: 'Pro' });

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const newCompany = {
      id: `comp_${Date.now()}`,
      name: form.name,
      document: form.document,
      status: 'active' as const,
      plan: form.plan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addCompany(newCompany);
    toast.success('Empresa cadastrada com sucesso!');
    setIsModalOpen(false);
    setForm({ name: '', document: '', plan: 'Pro' });
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    updateCompany(id, { status: currentStatus === 'active' ? 'inactive' : 'active' });
    toast.info('Status da empresa atualizado.');
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Empresas Clientes</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
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
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Plano</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.map(company => (
              <tr key={company.id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-900">{company.name}</p>
                  <p className="text-xs text-slate-500">ID: {company.id}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{company.document}</td>
                <td className="px-6 py-4">
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                    {company.plan}
                  </span>
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
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => toggleStatus(company.id, company.status)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                      company.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    {company.status === 'active' ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Nova Empresa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Cadastrar Nova Empresa</h3>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Nome da Empresa</label>
                <input required type="text" className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">CNPJ</label>
                <input required type="text" className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" value={form.document} onChange={e => setForm({...form, document: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Plano</label>
                <select className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" value={form.plan} onChange={e => setForm({...form, plan: e.target.value})}>
                  <option>Starter</option>
                  <option>Pro</option>
                  <option>Enterprise</option>
                </select>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30">Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};