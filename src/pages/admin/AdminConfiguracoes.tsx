import React, { useState, useEffect } from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Building2, Palette, Image as ImageIcon, Save, CheckCircle2, Upload, RefreshCcw, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { uploadImage } from '../../lib/storage';

const AdminConfiguracoes = () => {
  const { currentUser, companies, updateCompany } = useAgro();

  // Encontra os dados da empresa do administrador logado
  const company = companies.find(c => c.id === currentUser?.companyId);

  const [form, setForm] = useState({
    name: 'Eleven Tech',
    document: '',
    slug: '',
    primaryColor: '#10b981', 
    secondaryColor: '#064e3b',
    isGradient: false,
    logo: 'https://ik.imagekit.io/lflb43qwh/ElevenTech/Eleven%20Tech%20Logo.jpeg'
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || 'Eleven Tech',
        document: company.document || '',
        slug: company.slug || '',
        primaryColor: company.primaryColor || '#10b981',
        secondaryColor: company.secondaryColor || '#064e3b',
        isGradient: !!company.isGradient,
        logo: company.logo || 'https://ik.imagekit.io/lflb43qwh/ElevenTech/Eleven%20Tech%20Logo.jpeg'
      });
    }
  }, [company]);

  const [isSaving, setIsSaving] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (company) {
      try {
        setIsSaving(true);
        console.log("[SETTINGS] Salvando configurações...");
        await updateCompany(company.id, {
          name: form.name,
          document: form.document,
          slug: form.slug,
          primaryColor: form.primaryColor,
          secondaryColor: form.secondaryColor,
          isGradient: form.isGradient,
          logo: form.logo
        });
        toast.success('Configurações salvas com sucesso!');
      } catch (error: any) {
        console.error("[SETTINGS] Falha ao salvar:", error);
        toast.error(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      setForm({ ...form, logo: url });
      toast.success('Logo atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer upload da logo');
    } finally {
      setIsUploading(false);
    }
  };

  const buttonStyle = {
    background: form.isGradient
      ? `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})`
      : form.primaryColor
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
            <Palette size={20} className="text-brand" />
            <h3 className="font-bold text-slate-800">Visual e Marca</h3>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Upload Logo */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-3">Logo da Empresa</label>
              <label
                htmlFor="logo-upload"
                className="w-32 h-32 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 hover:bg-slate-100 hover:border-brand transition-all group cursor-pointer relative shadow-inner"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCcw className="animate-spin text-brand" size={24} />
                    <span className="text-[10px] font-bold text-slate-400">Subindo...</span>
                  </div>
                ) : form.logo ? (
                  <>
                    <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ImagePlus className="text-white" size={24} />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-400 group-hover:text-brand transition-colors">
                    <ImagePlus size={28} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Logo</span>
                  </div>
                )}
              </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <p className="text-[11px] text-slate-400 mt-3">Tamanho recomendado: 500x500px (PNG ou JPG)</p>
              </div>

            {/* Cor Principal */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-700">Cores da Identidade</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isGradient: !form.isGradient })}
                  className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all border ${form.isGradient ? 'bg-brand text-white border-brand' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                >
                  {form.isGradient ? 'MODO DEGRADÊ ATIVO' : 'ATIVAR DEGRADÊ'}
                </button>
              </div>

              <div className="space-y-4">
                {/* Cor 1 */}
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 shadow-sm"
                  />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor Principal</p>
                    <input
                      type="text"
                      value={form.primaryColor.toUpperCase()}
                      onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                      className="text-sm font-black text-slate-700 bg-transparent border-0 p-0 focus:outline-none uppercase w-20"
                    />
                  </div>
                </div>

                {/* Cor 2 (Só aparece se degradê ativo) */}
                {form.isGradient && (
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                    <input
                      type="color"
                      value={form.secondaryColor}
                      onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 shadow-sm"
                    />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor Secundária</p>
                      <input
                        type="text"
                        value={form.secondaryColor.toUpperCase()}
                        onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
                        className="text-sm font-black text-slate-700 bg-transparent border-0 p-0 focus:outline-none uppercase w-20"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Preview do Botão */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Preview dos Elementos</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="px-6 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
                    style={buttonStyle}
                  >
                    <CheckCircle2 size={18} /> Botão Principal
                  </button>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
                    style={buttonStyle}
                  >
                    <ImageIcon size={18} />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-3">As cores serão aplicadas em todo o ecossistema Eleven Tech.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Seção 2: Informações da Empresa */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
            <Building2 size={20} className="text-brand" />
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
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">CNPJ</label>
              <input
                required
                type="text"
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={form.document}
                onChange={e => setForm({ ...form, document: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">URL Personalizada (Slug)</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm font-medium">eleventech.app/</span>
                <input 
                  required 
                  type="text" 
                  className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all lowercase" 
                  value={form.slug} 
                  onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} 
                  placeholder="nome-da-empresa"
                />
              </div>
              <p className="text-[11px] text-slate-400">Este será o endereço único para o login da sua empresa.</p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-brand px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-wait text-white"
          >
            {isSaving ? (
              <>
                <RefreshCcw size={20} className="animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save size={20} /> Salvar Configurações
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
};

export default AdminConfiguracoes;