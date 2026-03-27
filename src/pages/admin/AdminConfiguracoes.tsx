import React, { useState, useEffect } from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Building2, Palette, Image as ImageIcon, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminConfiguracoes = () => {
  const { currentUser, companies, updateCompany } = useAgro();
  
  // Encontra os dados da empresa do administrador logado
  const company = companies.find(c => c.id === currentUser?.companyId);

  const [form, setForm] = useState({
    name: '',
    document: '',
    primaryColor: '#10b981', // Padrão Emerald
    logo: ''
  });

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || '',
        document: company.document || '',
        primaryColor: company.primaryColor || '#10b981',
        logo: company.logo || ''
      });
    }
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (company) {
      updateCompany(company.id, {
        name: form.name,
        document: form.document,
        primaryColor: form.primaryColor,
        logo: form.logo
      });
      toast.success('Configurações salvas com sucesso!');
    }
  };

  const simulateLogoUpload = () => {
    // Simulando o upload gerando um avatar baseado no nome
    const mockLogoUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${form.name || 'Empresa'}&backgroundColor=${form.primaryColor.replace('#', '')}`;
    setForm({ ...form, logo: mockLogoUrl });
    toast.success('Logo simulada com sucesso!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Identidade da Empresa</h2>
        <p className="text-sm text-slate-500 mt-1">Personalize a marca da sua empresa no sistema e no aplicativo.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Identidade Visual */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
            <Palette size={20} className="text-emerald-600" />
            <h3 className="font-bold text-slate-800">Visual e Marca</h3>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Upload Logo */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-3">Logo da Empresa</label>
              <div 
                onClick={simulateLogoUpload}
                className="w-40 h-40 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 hover:border-emerald-500 transition-all group relative overflow-hidden bg-white"
              >
                {form.logo ? (
                  <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                      <ImageIcon size={24} />
                    </div>
                    <span className="text-xs font-medium text-slate-500 group-hover:text-emerald-600 text-center px-4">
                      Clique para alterar logo
                    </span>
                  </>
                )}
                {form.logo && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-sm font-bold">
                    Alterar Logo
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">Tamanho recomendado: 500x500px (PNG ou JPG)</p>
            </div>

            {/* Cor Principal */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-3">Cor Principal</label>
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  value={form.primaryColor}
                  onChange={e => setForm({...form, primaryColor: e.target.value})}
                  className="w-16 h-16 rounded-xl cursor-pointer border-0 p-0"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <input 
                      type="text" 
                      value={form.primaryColor.toUpperCase()} 
                      onChange={e => setForm({...form, primaryColor: e.target.value})}
                      className="w-28 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Usada nos botões e cabeçalhos do app</p>
                </div>
              </div>

              {/* Preview Button */}
              <div className="mt-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Preview do Botão</p>
                <button 
                  type="button" 
                  className="px-6 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 transition-all shadow-md"
                  style={{ backgroundColor: form.primaryColor }}
                >
                  <CheckCircle2 size={18} /> Botão no App
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Seção 2: Informações da Empresa */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
            <Building2 size={20} className="text-emerald-600" />
            <h3 className="font-bold text-slate-800">Dados Comerciais</h3>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Razão Social / Nome Fantasia</label>
              <input 
                required 
                type="text" 
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">CNPJ</label>
              <input 
                required 
                type="text" 
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                value={form.document} 
                onChange={e => setForm({...form, document: e.target.value})} 
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-xl shadow-slate-900/20 active:scale-95"
          >
            <Save size={20} /> Salvar Configurações
          </button>
        </div>
      </form>

    </div>
  );
};

export default AdminConfiguracoes;