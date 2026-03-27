import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgro } from '../../contexts/AgroContext';
import { CheckCircle2, ChevronRight, Factory, User, LogOut, DollarSign, ShieldAlert, ImagePlus, X, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

// ---- COLETA (PASSO 1) ----
export const UserColeta = () => {
  const { producers, currentUser, addLoad } = useAgro();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ 
    producerId: '', 
    location: '', 
    category: 'Frutas', 
    type: '', 
    boxes: '', 
    grossWeight: '',
    loaderName: '',
    observations: ''
  });

  const [photos, setPhotos] = useState<{file: File, preview: string}[]>([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Atualiza o relógio na tela (apenas visual, data real é pega no submit)
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file) // Cria URL local para preview imediato
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newArr = [...prev];
      URL.revokeObjectURL(newArr[index].preview); // Libera memória
      newArr.splice(index, 1);
      return newArr;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulação do upload criando objetos PhotoEvidence
    const photosEvidence = photos.map((p, i) => ({
      id: `photo_${Date.now()}_${i}`,
      url: p.preview,
      type: 'collection' as const
    }));

    const nowIso = new Date().toISOString();

    const newLoad = {
      id: `load_${Date.now()}`,
      companyId: currentUser?.companyId || '',
      producerId: form.producerId,
      status: 'coletado' as const,
      createdAt: nowIso,
      updatedAt: nowIso,
      collection: {
        id: `col_${Date.now()}`,
        date: nowIso,
        location: form.location,
        category: form.category,
        type: form.type,
        boxes: Number(form.boxes),
        grossWeight: Number(form.grossWeight),
        loaderName: form.loaderName,
        observations: form.observations,
        responsibleId: currentUser?.id || '',
        photos: photosEvidence
      }
    };
    
    addLoad(newLoad);
    toast.success('Carga registrada e sincronizada com sucesso!');
    navigate('/user/beneficiamento');
  };

  if (!currentUser?.permissions?.canCollect) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center mt-20">
        <ShieldAlert size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-800">Sem Permissão</h3>
        <p className="text-gray-500 text-sm mt-2">Você não possui acesso a esta etapa.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Nova Coleta</h2>
        <p className="text-gray-500 text-sm">Registro rápido na propriedade</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Bloco 1: Origem */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 mb-2 border-b border-gray-50 pb-3">
             <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
             <h3 className="font-bold text-gray-800">Origem & Data</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-2xl p-3 flex flex-col justify-center border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1"><Calendar size={12}/> Data auto</span>
              <span className="font-bold text-gray-700">{currentDateTime.toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 flex flex-col justify-center border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1"><Clock size={12}/> Hora auto</span>
              <span className="font-bold text-gray-700">{currentDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Produtor Rural</label>
            <select required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-800 font-medium appearance-none" value={form.producerId} onChange={e => setForm({...form, producerId: e.target.value})}>
              <option value="">Selecione o produtor...</option>
              {producers.map(p => <option key={p.id} value={p.id}>{p.name} - {p.property}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Local Exato da Coleta</label>
            <input required type="text" placeholder="Ex: Talhão 4, Gleba B..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-800 font-medium" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          </div>
        </div>

        {/* Bloco 2: Produto e Carga */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 mb-2 border-b border-gray-50 pb-3">
             <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">2</div>
             <h3 className="font-bold text-gray-800">Carga</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Produto / Variedade</label>
            <input required type="text" placeholder="Ex: Manga Palmer" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-800 font-medium text-lg" value={form.type} onChange={e => setForm({...form, type: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Qtd. Caixas</label>
              <input required type="number" placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-900 font-black text-xl text-center" value={form.boxes} onChange={e => setForm({...form, boxes: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Peso Bruto (kg)</label>
              <input required type="number" step="0.01" placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-emerald-700 font-black text-xl text-center" value={form.grossWeight} onChange={e => setForm({...form, grossWeight: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Bloco 3: Equipe e Observações */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 mb-2 border-b border-gray-50 pb-3">
             <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">3</div>
             <h3 className="font-bold text-gray-800">Equipe & Notas</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Nome do Carregador (Motorista)</label>
            <input required type="text" placeholder="Nome de quem vai transportar" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-800 font-medium" value={form.loaderName} onChange={e => setForm({...form, loaderName: e.target.value})} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Observações (Opcional)</label>
            <textarea placeholder="Alguma observação sobre a qualidade, acesso à roça..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-800 font-medium resize-none" value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} />
          </div>
        </div>

        {/* Bloco 4: Fotos */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">4</div>
              <h3 className="font-bold text-gray-800">Evidências</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 px-2 py-1 rounded-lg">Obrigatório</span>
          </div>

          <label className="bg-gray-50 border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors w-full group">
            <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center text-emerald-600 mb-1 group-hover:scale-110 transition-transform">
              <ImagePlus size={28} />
            </div>
            <span className="font-bold text-gray-700">Tirar Fotos da Carga</span>
            <span className="text-xs text-gray-400 font-medium text-center">Abra a câmera ou galeria do celular</span>
          </label>

          {/* Grid de Previews */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {photos.map((photo, idx) => (
                 <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                   <img src={photo.preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <button type="button" onClick={() => removePhoto(idx)} className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors">
                     <X size={14} />
                   </button>
                 </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão de Submit Gigante para Mobile */}
        <button 
          type="submit" 
          disabled={photos.length === 0}
          className="w-full bg-emerald-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-black text-lg py-5 rounded-2xl shadow-[0_8px_30px_rgb(16,185,129,0.3)] disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-8"
        >
          <CheckCircle2 size={24} /> {photos.length === 0 ? 'Adicione fotos para salvar' : 'Concluir Coleta'}
        </button>
      </form>
    </div>
  );
};

// ---- BENEFICIAMENTO (PASSO 2) ----
export const UserBeneficiamento = () => {
  const { loads, producers, updateLoad, currentUser } = useAgro();
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
    navigate('/user/financeiro');
  };

  if (!currentUser?.permissions?.canProcess) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center mt-20">
        <ShieldAlert size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-800">Sem Permissão</h3>
        <p className="text-gray-500 text-sm mt-2">Você não possui acesso a esta etapa.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">2. Beneficiamento</h2>
        <p className="text-gray-500 text-sm">Processamento no barracão</p>
      </div>

      {pendingLoads.length === 0 && !selectedLoadId && (
        <div className="p-8 text-center text-gray-500 mt-10 bg-white rounded-2xl border border-gray-100 border-dashed">
          <Factory size={48} className="mx-auto text-gray-300 mb-4"/>
          <p>Nenhuma carga aguardando beneficiamento no momento.</p>
        </div>
      )}

      {!selectedLoadId && pendingLoads.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Cargas aguardando:</h3>
          {pendingLoads.map(load => {
            const prod = producers.find(p => p.id === load.producerId);
            return (
              <div key={load.id} onClick={() => setSelectedLoadId(load.id)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:scale-95 transition">
                <div>
                  <p className="font-bold text-gray-800">{prod?.name}</p>
                  <p className="text-sm text-gray-500">{load.collection.type} - {load.collection.boxes} caixas</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Peso Coleta: {load.collection.grossWeight}kg</p>
                </div>
                <ChevronRight className="text-gray-300" />
              </div>
            );
          })}
        </div>
      )}

      {selectedLoadId && selectedLoad && (
        <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-right-8">
           <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex justify-between items-center">
             <div>
               <p className="text-xs text-emerald-600 uppercase font-bold">Carga Selecionada</p>
               <p className="font-medium text-emerald-900">{producers.find(p => p.id === selectedLoad.producerId)?.name}</p>
               <p className="text-sm text-emerald-700">Roça: {selectedLoad.collection.grossWeight} kg</p>
             </div>
             <button type="button" onClick={() => setSelectedLoadId('')} className="text-emerald-700 text-sm font-bold underline">Trocar</button>
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

// ---- FINANCEIRO (PASSO 3) ----
export const UserFinanceiro = () => {
  const { currentUser } = useAgro();

  if (!currentUser?.permissions?.canManageFinancial) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center mt-20">
        <ShieldAlert size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-800">Sem Permissão</h3>
        <p className="text-gray-500 text-sm mt-2">Você não possui acesso a esta etapa.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">3. Financeiro</h2>
        <p className="text-gray-500 text-sm">Cálculos e fechamentos de pagamentos</p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center text-slate-400 mt-10">
        <DollarSign size={48} className="text-slate-300 mb-4" />
        <p className="font-medium text-slate-600">Interface de Fechamento Financeiro</p>
        <p className="text-sm mt-2">Nesta etapa, o usuário com permissão lançará os valores da carga já beneficiada.</p>
      </div>
    </div>
  );
};

// ---- PERFIL DO USUÁRIO (PASSO 4) ----
export const UserPerfil = () => {
  const { currentUser, setCurrentUser } = useAgro();

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Meu Perfil</h2>
        <p className="text-gray-500 text-sm">Sua conta e permissões</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center mb-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-700 font-bold text-2xl flex items-center justify-center rounded-full mx-auto mb-4 border-4 border-white shadow-md">
          {currentUser?.name.charAt(0)}
        </div>
        <h3 className="text-xl font-bold text-gray-800">{currentUser?.name}</h3>
        <p className="text-gray-500">{currentUser?.email}</p>
        <div className="mt-3 inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
          Colaborador Operacional
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 space-y-3">
        <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><ShieldAlert size={18} className="text-emerald-500"/> Suas Permissões</h4>
        <div className="flex justify-between items-center py-2 border-b border-gray-50">
          <span className="text-sm text-gray-600">1. Coleta na Roça</span>
          {currentUser?.permissions?.canCollect ? <CheckCircle2 size={18} className="text-emerald-500"/> : <span className="text-gray-300 text-xs">Sem acesso</span>}
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-50">
          <span className="text-sm text-gray-600">2. Beneficiamento</span>
          {currentUser?.permissions?.canProcess ? <CheckCircle2 size={18} className="text-emerald-500"/> : <span className="text-gray-300 text-xs">Sem acesso</span>}
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-600">3. Lançamento Financeiro</span>
          {currentUser?.permissions?.canManageFinancial ? <CheckCircle2 size={18} className="text-emerald-500"/> : <span className="text-gray-300 text-xs">Sem acesso</span>}
        </div>
      </div>

      <button 
        onClick={() => setCurrentUser(null)} 
        className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 active:scale-95 transition"
      >
        <LogOut size={20} /> Sair da Conta
      </button>
    </div>
  );
};