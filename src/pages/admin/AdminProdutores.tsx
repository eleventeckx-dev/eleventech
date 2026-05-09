import React, { useState } from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Producer } from '../../types';
import { Tractor, Edit2, Trash2, Plus, Phone, MapPin, Mail, Lock, Power, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

type UnitDraft = {
  id: string;
  name: string;
  location: string;
  description: string;
};

const emptyUnitDraft = (): UnitDraft => ({
  id: '',
  name: '',
  location: '',
  description: '',
});

const AdminProdutores = () => {
  const {
    producers,
    producerUnits,
    currentUser,
    addProducer,
    updateProducer,
    deleteProducer,
    addProducerUnit,
    updateProducerUnit,
    deactivateProducerUnit,
  } = useAgro();
  
  // Filtra apenas os produtores da empresa atual
  const companyProducers = producers.filter(p => p.companyId === currentUser?.companyId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stagedUnits, setStagedUnits] = useState<UnitDraft[]>([]);
  const [unitForm, setUnitForm] = useState<UnitDraft>(emptyUnitDraft());
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    property: '',
    phone: '',
    email: '',
    password: '',
  });

  const getProducerUnits = (producerId: string) =>
    producerUnits
      .filter(unit => unit.producerId === producerId)
      .sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name));

  const resetUnitEditor = () => {
    setUnitForm(emptyUnitDraft());
    setEditingUnitId(null);
  };

  const resetModalState = () => {
    setForm({ name: '', property: '', phone: '', email: '', password: '' });
    setStagedUnits([]);
    resetUnitEditor();
  };

  const openAddModal = () => {
    setEditingId(null);
    resetModalState();
    setIsModalOpen(true);
  };

  const openEditModal = (producer: Producer) => {
    setEditingId(producer.id);
    setStagedUnits([]);
    resetUnitEditor();
    setForm({
      name: producer.name,
      property: producer.property,
      phone: producer.phone,
      email: producer.email || '',
      password: producer.password || '',
    });
    setIsModalOpen(true);
  };

  const getDuplicateUnit = (name: string) => {
    const normalized = name.trim().toLowerCase();
    if (!normalized) return null;

    if (editingId) {
      return getProducerUnits(editingId).find(unit => unit.id !== editingUnitId && unit.name.trim().toLowerCase() === normalized);
    }

    return stagedUnits.find(unit => unit.id !== editingUnitId && unit.name.trim().toLowerCase() === normalized);
  };

  const saveUnit = async () => {
    const name = unitForm.name.trim();
    if (!name) {
      toast.error('Informe o nome da roça/unidade.');
      return;
    }

    if (getDuplicateUnit(name)) {
      toast.error('Ja existe uma unidade com este nome para o produtor.');
      return;
    }

    const payload = {
      name,
      location: unitForm.location.trim(),
      description: unitForm.description.trim(),
    };

    try {
      if (editingId) {
        if (editingUnitId) {
          await updateProducerUnit(editingUnitId, payload);
          toast.success('Unidade atualizada!');
        } else {
          await addProducerUnit({
            id: crypto.randomUUID(),
            companyId: currentUser?.companyId || '',
            producerId: editingId,
            ...payload,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          toast.success('Unidade adicionada!');
        }
      } else if (editingUnitId) {
        setStagedUnits(prev => prev.map(unit => unit.id === editingUnitId ? { ...unit, ...payload } : unit));
        toast.success('Unidade atualizada na lista.');
      } else {
        setStagedUnits(prev => [...prev, { id: crypto.randomUUID(), ...payload }]);
        toast.success('Unidade adicionada a este produtor.');
      }

      resetUnitEditor();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar unidade.');
    }
  };

  const editStagedUnit = (unit: UnitDraft) => {
    setEditingUnitId(unit.id);
    setUnitForm(unit);
  };

  const removeStagedUnit = (id: string) => {
    setStagedUnits(prev => prev.filter(unit => unit.id !== id));
    if (editingUnitId === id) resetUnitEditor();
  };

  const buildInitialUnits = () => {
    let units = [...stagedUnits];

    if (unitForm.name.trim()) {
      const pendingUnit = {
        id: editingUnitId || crypto.randomUUID(),
        name: unitForm.name.trim(),
        location: unitForm.location.trim(),
        description: unitForm.description.trim(),
      };

      units = editingUnitId
        ? units.map(unit => unit.id === editingUnitId ? pendingUnit : unit)
        : [...units, pendingUnit];
    }

    return units.map(({ name, location, description }) => ({ name, location, description }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateProducer(editingId, form);
        toast.success('Produtor atualizado com sucesso!');
      } else {
        const newProducer: Producer = {
          id: crypto.randomUUID(), // Temporario, sera sobrescrito pelo ID do auth no backend
          companyId: currentUser?.companyId || '',
          ...form,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addProducer(newProducer, buildInitialUnits());
        toast.success('Produtor cadastrado com sucesso!');
      }
      setIsModalOpen(false);
      resetModalState();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar o produtor.');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produtor? As cargas vinculadas a ele poderao perder a referencia.')) {
      deleteProducer(id);
      toast.success('Produtor excluido!');
    }
  };

  const renderUnitSummary = (producer: Producer) => {
    const units = getProducerUnits(producer.id);
    if (units.length === 0) {
      return <span className="text-[11px] text-slate-400 font-medium">Sem unidades cadastradas</span>;
    }

    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {units.slice(0, 4).map(unit => (
          <span
            key={unit.id}
            className={`text-[10px] px-2 py-1 rounded-lg font-bold border ${
              unit.isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            {unit.name}
          </span>
        ))}
        {units.length > 4 && (
          <span className="text-[10px] px-2 py-1 rounded-lg font-bold bg-slate-100 text-slate-500">
            +{units.length - 4}
          </span>
        )}
      </div>
    );
  };

  const modalUnits = editingId ? getProducerUnits(editingId) : stagedUnits;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Gestao de Produtores</h2>
          <p className="text-sm text-slate-500 mt-1">Cadastre os produtores para que eles possam acompanhar suas cargas.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 w-full md:w-auto"
        >
          <Plus size={20} /> Novo Produtor
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Produtor</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Contato / Acesso</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companyProducers.map(producer => (
              <tr key={producer.id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100 shrink-0">
                      <Tractor size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{producer.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin size={12} /> {producer.property}
                      </div>
                      {renderUnitSummary(producer)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      {producer.phone}
                    </div>
                    {producer.email ? (
                      <div className="flex items-center gap-2 text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md w-fit">
                        <Mail size={14} /> {producer.email}
                      </div>
                    ) : (
                      <div className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md w-fit">Sem acesso web</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => openEditModal(producer)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(producer.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {companyProducers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                  Nenhum produtor encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3">
        {companyProducers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            Nenhum produtor encontrado.
          </div>
        ) : (
          companyProducers.map(producer => (
            <div key={producer.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100 shrink-0">
                  <Tractor size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 leading-tight truncate">{producer.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <MapPin size={12} /> <span className="truncate">{producer.property}</span>
                  </div>
                  {renderUnitSummary(producer)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{producer.phone}</span>
                  </div>
                  {producer.email ? (
                    <div className="flex items-center gap-2 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md w-fit">
                      <Mail size={12} /> <span className="truncate max-w-[150px]">{producer.email}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md w-fit">Sem acesso web</div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => openEditModal(producer)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(producer.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Cadastro / Edicao */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Tractor className="text-emerald-600" />
              {editingId ? 'Editar Produtor' : 'Novo Produtor'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Nome Completo / Razao Social</label>
                  <input required type="text" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Jose da Silva" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Telefone para Contato</label>
                  <input required type="text" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="(00) 00000-0000" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Nome da Propriedade (Referencia de Local)</label>
                  <input required type="text" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={form.property} onChange={e => setForm({...form, property: e.target.value})} placeholder="Ex: Fazenda Esperanca" />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  Roças / Unidades
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <input
                    value={unitForm.name}
                    onChange={e => setUnitForm({ ...unitForm, name: e.target.value })}
                    placeholder="Nome da unidade *"
                    className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                  <input
                    value={unitForm.location}
                    onChange={e => setUnitForm({ ...unitForm, location: e.target.value })}
                    placeholder="Localizacao / referencia"
                    className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                  <textarea
                    value={unitForm.description}
                    onChange={e => setUnitForm({ ...unitForm, description: e.target.value })}
                    placeholder="Descricao opcional"
                    className="md:col-span-2 min-h-20 w-full border border-slate-200 bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                  />
                  <div className="md:col-span-2 flex gap-2">
                    <button type="button" onClick={saveUnit} className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                      {editingUnitId ? <Edit2 size={16} /> : <Plus size={16} />}
                      {editingUnitId ? 'Salvar Unidade' : 'Adicionar Unidade'}
                    </button>
                    {editingUnitId && (
                      <button type="button" onClick={resetUnitEditor} className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition">
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {modalUnits.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-4 text-sm text-slate-500 text-center">
                      {editingId
                        ? 'Nenhuma unidade cadastrada para este produtor.'
                        : 'A unidade inicial tambem sera criada a partir da propriedade, se aplicavel.'}
                    </div>
                  ) : (
                    modalUnits.map(unit => {
                      const isExistingUnit = 'isActive' in unit;
                      const isActive = isExistingUnit ? unit.isActive : true;

                      return (
                        <div key={unit.id} className={`border rounded-2xl p-3 ${isActive ? 'border-emerald-100 bg-white' : 'border-slate-200 bg-slate-50 opacity-75'}`}>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-800 truncate">{unit.name}</p>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                  {isActive ? 'Ativa' : 'Inativa'}
                                </span>
                              </div>
                              {unit.location && <p className="text-xs text-slate-500 font-medium mt-1">{unit.location}</p>}
                              {unit.description && <p className="text-xs text-slate-500 mt-1">{unit.description}</p>}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => isExistingUnit ? (setEditingUnitId(unit.id), setUnitForm({ id: unit.id, name: unit.name, location: unit.location || '', description: unit.description || '' })) : editStagedUnit(unit)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Editar unidade"
                              >
                                <Edit2 size={16} />
                              </button>

                              {isExistingUnit ? (
                                isActive ? (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await deactivateProducerUnit(unit.id);
                                      toast.success('Unidade inativada.');
                                    }}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Inativar unidade"
                                  >
                                    <Power size={16} />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await updateProducerUnit(unit.id, { isActive: true });
                                      toast.success('Unidade reativada.');
                                    }}
                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                    title="Reativar unidade"
                                  >
                                    <RotateCcw size={16} />
                                  </button>
                                )
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => removeStagedUnit(unit.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Remover unidade"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2"><Lock size={16} className="text-slate-400"/> Acesso ao Painel do Produtor</h4>
                <p className="text-xs text-slate-500 mb-4">Preencha o e-mail e senha para que o produtor possa acompanhar suas cargas e fechamentos financeiros.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">E-mail de Login</label>
                    <input type="email" autoComplete="new-password" data-lpignore="true" className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="produtor@email.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Senha de Acesso</label>
                    <input type="password" autoComplete="new-password" data-lpignore="true" className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Defina uma senha" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30">
                  {editingId ? 'Salvar Alteracoes' : 'Cadastrar Produtor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProdutores;
