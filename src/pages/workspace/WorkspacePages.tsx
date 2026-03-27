import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgro } from '../../contexts/AgroContext';
import { Camera, Upload, CheckCircle2, ChevronRight, Truck, Factory, DollarSign } from 'lucide-react';

// ---- HOME WORKSPACE ----
export const WorkspaceHome = () => {
  const { currentUser, loads } = useAgro();
  const myLoads = loads.filter(l => l.collection.responsibleId === currentUser?.id);
  const pendingProcessing = loads.filter(l => l.status === 'coletado').length;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-1">Olá, {currentUser?.name.split(' ')[0]}!</h2>
        <p className="text-emerald-100 opacity-90 mb-4">Pronto para mais um dia de campo?</p>
        <div className="flex bg-black/20 rounded-xl p-4 divide-x divide-emerald-500/30">
          <div className="flex-1 text-center">
            <p className="text-3xl font-bold">{myLoads.length}</p>
            <p className="text-xs text-emerald-100 uppercase mt-1">Minhas Coletas</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-3xl font-bold">{pendingProcessing}</p>
            <p className="text-xs text-emerald-100 uppercase mt-1">A Beneficiar</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 px-1">Acesso Rápido</h3>
        {currentUser?.permissions?.canCollect && (
          <button onClick={() => window.location.href='/workspace/coleta'} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Truck size={24} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-gray-800">Nova Coleta</h4>
              <p className="text-sm text-gray-500">Registrar carga na roça</p>
            </div>
            <ChevronRight className="text-gray-300" />
          </button>
        )}
        {currentUser?.permissions?.canProcess && (
          <button onClick={() => window.location.href='/workspace/beneficiamento'} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Factory size={24} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-gray-800">Beneficiamento</h4>
              <p className="text-sm text-gray-500">Recebimento no barracão</p>
            </div>
            <ChevronRight className="text-gray-300" />
          </button>
        )}
      </div>
    </div>
  );
};

// ---- COLETA (PASSO 1) ----
export const WorkspaceColeta = () => {
  const { producers, currentUser, addLoad } = useAgro();
  const navigate = useNavigate();
  const [form, setForm] = useState({ producerId: '', location: '', category: 'Frutas', type: '', boxes: '', grossWeight: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLoad = {
      id: `load_${Date.now()}`,
      companyId: currentUser?.companyId || '',
      producerId: form.producerId,
      status: 'coletado' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      collection: {
        id: `col_${Date.now()}`,
        date: new Date().toISOString(),
        location: form.location,
        category: form.category,
        type: form.type,
        boxes: Number(form.boxes),
        grossWeight: Number(form.grossWeight),
        responsibleId: currentUser?.id || '',
        photos: []
      }
    };
    addLoad(newLoad);
    alert('Coleta registrada com sucesso!');
    navigate('/workspace/home');
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Nova Coleta</h2>
        <p className="text-gray-500 text-sm">Registro de carga na roça</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 ml-1">Produtor</label>
          <select required className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" value={form.producerId} onChange={e => setForm({...form, producerId: e.target.value})}>
            <option value="">Selecione o produtor</option>
            {producers.map(p => <option key={p.id} value={p.id}>{p.name} - {p.property}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 ml-1">Local da Coleta</label>
          <input required type="text" placeholder="Ex: Talhão 4" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">Categoria</label>
            <select className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option>Frutas</option>
              <option>Vegetais</option>
              <option>Grãos</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">Variedade</label>
            <input required type="text" placeholder="Ex: Manga" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" value={form.type} onChange={e => setForm({...form, type: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">Qtd. Caixas</label>
            <input required type="number" placeholder="0" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-bold" value={form.boxes} onChange={e => setForm({...form, boxes: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">Peso Bruto (kg)</label>
            <input required type="number" placeholder="0.00" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-bold" value={form.grossWeight} onChange={e => setForm({...form, grossWeight: e.target.value})} />
          </div>
        </div>

        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition">
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-emerald-600 mb-2">
            <Camera size={24} />
          </div>
          <span className="font-medium text-gray-700">Tirar Foto da Carga</span>
          <span className="text-xs text-gray-400">Obrigatório 2 fotos</span>
        </div>

        <button type="submit" className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
          <CheckCircle2 /> Finalizar Coleta
        </button>
      </form>
    </div>
  );
};

// ---- BENEFICIAMENTO (PASSO 2) ----
export const WorkspaceBeneficiamento = () => {
  const { loads, producers, updateLoad } = useAgro();
  const navigate = useNavigate();
  const pendingLoads = loads.filter(l => l.status === 'coletado');
  
  const [selectedLoadId, setSelectedLoadId] = useState('');
  const [form, setForm] = useState({ receivedWeight: '', damage: '', discard: '' });

  const selectedLoad = pendingLoads.find(l => l.id === selectedLoadId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoad) return;

    const received = Number(form.receivedWeight);
    const damage = Number(form.damage);
    const discard = Number(form.discard);
    const netWeight = received - damage - discard;
    const diff = selectedLoad.collection.grossWeight - received;

    updateLoad(selectedLoad.id, {
      status: 'beneficiado',
      processing: {
        id: `proc_${Date.now()}`,
        fieldWeight: selectedLoad.collection.grossWeight,
        receivedWeight: received,
        damage,
        discard,
        netWeight,
        weightDifference: diff,
        photos: []
      }
    });
    alert('Beneficiamento concluído!');
    navigate('/workspace/home');
  };

  if (pendingLoads.length === 0) return <div className="p-8 text-center text-gray-500 mt-20"><Factory size={48} className="mx-auto text-gray-300 mb-4"/> Nenhuma carga aguardando beneficiamento.</div>;

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Beneficiamento</h2>
        <p className="text-gray-500 text-sm">Processamento no barracão</p>
      </div>

      {!selectedLoadId ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Selecione uma carga:</h3>
          {pendingLoads.map(load => {
            const prod = producers.find(p => p.id === load.producerId);
            return (
              <div key={load.id} onClick={() => setSelectedLoadId(load.id)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:scale-95 transition">
                <div>
                  <p className="font-bold text-gray-800">{prod?.name}</p>
                  <p className="text-sm text-gray-500">{load.collection.type} - {load.collection.boxes} caixas</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Peso Roça: {load.collection.grossWeight}kg</p>
                </div>
                <ChevronRight className="text-gray-300" />
              </div>
            );
          })}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-right-8">
           <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex justify-between items-center">
             <div>
               <p className="text-xs text-emerald-600 uppercase font-bold">Carga Selecionada</p>
               <p className="font-medium text-emerald-900">{producers.find(p => p.id === selectedLoad.producerId)?.name}</p>
               <p className="text-sm text-emerald-700">Roça: {selectedLoad.collection.grossWeight} kg</p>
             </div>
             <button type="button" onClick={() => setSelectedLoadId('')} className="text-emerald-700 text-sm underline">Trocar</button>
           </div>

           <div className="space-y-1">
             <label className="text-sm font-medium text-gray-700 ml-1">Peso Recebido (kg)</label>
             <input required type="number" placeholder="0.00" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-bold" value={form.receivedWeight} onChange={e => setForm({...form, receivedWeight: e.target.value})} />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-sm font-medium text-gray-700 ml-1">Avarias (kg)</label>
               <input required type="number" placeholder="0" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" value={form.damage} onChange={e => setForm({...form, damage: e.target.value})} />
             </div>
             <div className="space-y-1">
               <label className="text-sm font-medium text-gray-700 ml-1">Descarte (kg)</label>
               <input required type="number" placeholder="0" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" value={form.discard} onChange={e => setForm({...form, discard: e.target.value})} />
             </div>
           </div>

           {/* Preview Calculado */}
           <div className="bg-gray-800 text-white p-4 rounded-xl mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Peso Líquido Calculado:</span>
                <span className="font-bold text-xl text-emerald-400">
                  {form.receivedWeight ? Math.max(0, Number(form.receivedWeight) - Number(form.damage) - Number(form.discard)) : 0} kg
                </span>
              </div>
           </div>

           <button type="submit" className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2">
            <CheckCircle2 /> Finalizar Beneficiamento
          </button>
        </form>
      )}
    </div>
  );
};

// ---- FINANCEIRO & PAGAMENTOS PLACEHOLDERS (mesma lógica) ----
// Para manter o tamanho do código, os fluxos Financeiro e Pagamentos no Mobile 
// seguem a mesma estrutura de lista -> seleciona -> processa.