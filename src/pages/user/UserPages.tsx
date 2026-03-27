import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAgro } from '../../contexts/AgroContext';
import { 
  CheckCircle2, ChevronRight, Factory, User, LogOut, DollarSign, 
  ShieldAlert, ImagePlus, X, Calendar, Clock, Plus, Truck, Scale, AlertTriangle, ArrowRight, Receipt, Lock
} from 'lucide-react';
import { toast } from 'sonner';

// ---- REDIRECIONAMENTO INTELIGENTE DA RAIZ DO APP ----
export const UserIndexRedirect = () => {
  const { currentUser } = useAgro();
  
  if (!currentUser) return <Navigate to="/" replace />;
  
  if (currentUser.permissions?.canCollect) return <Navigate to="/user/coleta" replace />;
  if (currentUser.permissions?.canProcess) return <Navigate to="/user/beneficiamento" replace />;
  if (currentUser.permissions?.canManageFinancial) return <Navigate to="/user/financeiro" replace />;
  
  // Default fallback é a coleta (sempre como read-only ou editável dependendo da permissão)
  return <Navigate to="/user/coleta" replace />;
};


// ---- COLETA (PASSO 1) ----
export const UserColeta = () => {
  const { producers, currentUser, loads, addLoad } = useAgro();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const hasPermission = currentUser?.permissions?.canCollect;

  useEffect(() => {
    let timer: number;
    if (isModalOpen) {
      setCurrentDateTime(new Date());
      timer = window.setInterval(() => setCurrentDateTime(new Date()), 60000);
    }
    return () => clearInterval(timer);
  }, [isModalOpen]);

  // Lista coletas gerais da empresa para que todos os colaboradores possam visualizar o fluxo
  const visibleLoads = loads
    .filter(l => l.companyId === currentUser?.companyId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file) 
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newArr = [...prev];
      URL.revokeObjectURL(newArr[index].preview);
      newArr.splice(index, 1);
      return newArr;
    });
  };

  const resetForm = () => {
    setForm({ producerId: '', location: '', category: 'Frutas', type: '', boxes: '', grossWeight: '', loaderName: '', observations: '' });
    setPhotos([]);
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission) return;
    
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
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'coletado': return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-200">Enviado ao Barracão</span>;
      case 'beneficiado': return <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-indigo-200">Beneficiado</span>;
      case 'pagamento_programado': return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-amber-200">Pagamento Prog.</span>;
      case 'pago': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-emerald-200">Concluído</span>;
      default: return null;
    }
  };

  return (
    <div className="p-4 pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Coletas Registradas</h2>
        <p className="text-gray-500 text-sm">Acompanhe os registros de campo</p>
      </div>

      {!hasPermission ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl mb-8 text-sm flex items-start gap-3 shadow-sm">
          <ShieldAlert size={20} className="shrink-0 mt-0.5" /> 
          <p>Você tem permissão <b>apenas para visualizar</b> o fluxo de coletas registradas na empresa.</p>
        </div>
      ) : (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_8px_20px_rgb(16,185,129,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 mb-8"
        >
          <Plus size={24} /> Registrar Nova Coleta
        </button>
      )}

      <div className="space-y-4">
        {visibleLoads.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-3xl border border-gray-100 border-dashed shadow-sm">
            <Truck size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1.5} />
            <h3 className="text-gray-800 font-bold mb-1">Nenhuma coleta registrada</h3>
            <p className="text-gray-500 text-sm">{hasPermission ? 'Toque no botão acima para registrar a primeira carga.' : 'Não há registros vinculados à sua empresa ainda.'}</p>
          </div>
        ) : (
          visibleLoads.map(load => {
            const prod = producers.find(p => p.id === load.producerId);
            const isMyLoad = load.collection.responsibleId === currentUser?.id;

            return (
              <div key={load.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ID: {load.id.slice(-8)}</p>
                      {isMyLoad && (
                        <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-100 uppercase">Meu Registro</span>
                      )}
                    </div>
                    <p className="font-bold text-gray-800 leading-tight">{prod?.name}</p>
                  </div>
                  {getStatusBadge(load.status)}
                </div>

                <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                     <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold text-xs">
                       {load.collection.type.charAt(0)}
                     </span>
                     <div>
                       <p className="text-sm font-bold text-gray-700">{load.collection.type}</p>
                       <p className="text-[11px] text-gray-500">{load.collection.boxes} cx • {load.collection.grossWeight} kg</p>
                     </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(load.createdAt).toLocaleDateString('pt-BR')}</span>
                  <span className="flex items-center gap-1"><Clock size={12}/> {new Date(load.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {isModalOpen && hasPermission && (
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
               <Truck className="text-emerald-600" size={20} /> Nova Coleta
            </h2>
            <button onClick={resetForm} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-32 custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6">
              
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

              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b border-gray-50 pb-3">
                   <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">3</div>
                   <h3 className="font-bold text-gray-800">Equipe & Notas</h3>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Nome do Carregador</label>
                  <input required type="text" placeholder="Nome de quem vai transportar" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-800 font-medium" value={form.loaderName} onChange={e => setForm({...form, loaderName: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Observações (Opcional)</label>
                  <textarea placeholder="Alguma observação sobre a qualidade..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-800 font-medium resize-none" value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} />
                </div>
              </div>

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
                  <span className="text-xs text-gray-400 font-medium text-center">Abra a câmera ou galeria</span>
                </label>
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {photos.map((photo, idx) => (
                       <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                         <img src={photo.preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <button type="button" onClick={() => removePhoto(idx)} className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1.5 shadow-md flex items-center justify-center">
                           <X size={14} />
                         </button>
                       </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={photos.length === 0}
                className="w-full bg-emerald-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-black text-lg py-5 rounded-2xl shadow-[0_8px_30px_rgb(16,185,129,0.3)] disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-8"
              >
                <CheckCircle2 size={24} /> {photos.length === 0 ? 'Adicione fotos para salvar' : 'Concluir Coleta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- BENEFICIAMENTO (PASSO 2) ----
export const UserBeneficiamento = () => {
  const { loads, producers, updateLoad, currentUser } = useAgro();
  
  const pendingLoads = loads.filter(l => l.companyId === currentUser?.companyId && l.status === 'coletado');
  
  const [selectedLoadId, setSelectedLoadId] = useState('');
  const [photos, setPhotos] = useState<{file: File, preview: string}[]>([]);
  const [form, setForm] = useState({ 
    receivedWeight: '', 
    damage: '', 
    discard: '',
    observations: '' 
  });

  const hasPermission = currentUser?.permissions?.canProcess;
  const selectedLoad = pendingLoads.find(l => l.id === selectedLoadId);

  // Variáveis calculadas em tempo real
  const fieldWeight = selectedLoad?.collection.grossWeight || 0;
  const received = Number(form.receivedWeight) || 0;
  const damage = Number(form.damage) || 0;
  const discard = Number(form.discard) || 0;
  const netWeight = Math.max(0, received - damage - discard);
  const diffWeight = received - fieldWeight;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file) 
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newArr = [...prev];
      URL.revokeObjectURL(newArr[index].preview);
      newArr.splice(index, 1);
      return newArr;
    });
  };

  const closeForm = () => {
    setSelectedLoadId('');
    setForm({ receivedWeight: '', damage: '', discard: '', observations: '' });
    setPhotos([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoad || !hasPermission) return;

    const photosEvidence = photos.map((p, i) => ({
      id: `photo_${Date.now()}_${i}`,
      url: p.preview,
      type: 'processing' as const
    }));

    updateLoad(selectedLoad.id, {
      status: 'beneficiado',
      processing: {
        id: `proc_${Date.now()}`,
        fieldWeight: fieldWeight,
        receivedWeight: received,
        damage,
        discard,
        netWeight,
        weightDifference: diffWeight,
        observations: form.observations,
        photos: photosEvidence
      }
    });
    
    toast.success('Beneficiamento concluído e registrado!');
    closeForm();
  };

  return (
    <div className="p-4 pb-24">
      {/* Cabeçalho da Lista */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Beneficiamento</h2>
        <p className="text-gray-500 text-sm">Conferência de cargas no barracão</p>
      </div>

      {!hasPermission && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl mb-6 text-sm flex items-start gap-3 shadow-sm">
          <ShieldAlert size={20} className="shrink-0 mt-0.5" /> 
          <p>Você tem acesso <b>apenas para visualização</b>. O preenchimento da conferência está bloqueado.</p>
        </div>
      )}

      {/* Lista de Cargas Pendentes */}
      {pendingLoads.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-3xl border border-gray-100 border-dashed shadow-sm mt-10">
          <Factory size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1.5} />
          <h3 className="text-gray-800 font-bold mb-1">Nenhuma carga aguardando</h3>
          <p className="text-gray-500 text-sm">As cargas coletadas na roça aparecerão aqui para conferência.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingLoads.map(load => {
            const prod = producers.find(p => p.id === load.producerId);
            return (
              <div 
                key={load.id} 
                onClick={() => hasPermission && setSelectedLoadId(load.id)} 
                className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all group ${hasPermission ? 'cursor-pointer active:scale-95 hover:border-blue-200' : 'opacity-80 grayscale-[20%]'}`}
              >
                <div>
                  <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Aguardando Conferência</p>
                  <p className="font-bold text-gray-800 leading-tight">{prod?.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px] font-bold">
                       {load.collection.type}
                     </span>
                     <span className="text-xs font-bold text-blue-600">
                       Roça: {load.collection.grossWeight} kg
                     </span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${hasPermission ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {hasPermission ? <ArrowRight size={20} /> : <Lock size={18} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL / POP-UP MOBILE (FULL SCREEN) - Formulário de Beneficiamento */}
      {selectedLoadId && selectedLoad && hasPermission && (
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
          
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
               <Scale className="text-blue-600" size={20} /> Conferência
            </h2>
            <button onClick={closeForm} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-32 custom-scrollbar">
            
            {/* Resumo da Carga Selecionada (Read-Only) */}
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 mb-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Carga Selecionada</p>
                  <h3 className="font-bold text-blue-900">{producers.find(p => p.id === selectedLoad.producerId)?.name}</h3>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Peso da Roça</p>
                   <p className="font-black text-xl text-blue-700">{fieldWeight} <span className="text-sm">kg</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 bg-blue-100/50 p-2 rounded-lg">
                <span>{selectedLoad.collection.type}</span> • <span>{selectedLoad.collection.boxes} Caixas</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Bloco 1: Pesagem Recebida */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b border-gray-50 pb-3">
                   <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                   <h3 className="font-bold text-gray-800">Pesagem Recebida</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Peso na Balança (kg)</label>
                  <input required type="number" step="0.01" placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-blue-700 font-black text-2xl text-center" value={form.receivedWeight} onChange={e => setForm({...form, receivedWeight: e.target.value})} />
                </div>

                {/* Diferença de Peso Dinâmica */}
                {form.receivedWeight && (
                  <div className={`p-3 rounded-xl flex justify-between items-center text-sm font-bold border ${diffWeight < 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                    <span>Diferença da Roça:</span>
                    <span>{diffWeight > 0 ? '+' : ''}{diffWeight.toFixed(2)} kg</span>
                  </div>
                )}
              </div>

              {/* Bloco 2: Perdas e Avarias */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b border-gray-50 pb-3">
                   <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">2</div>
                   <h3 className="font-bold text-gray-800 flex items-center gap-2">Perdas <AlertTriangle size={16} className="text-amber-500"/></h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1">Avarias (kg)</label>
                    <input required type="number" step="0.01" placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition text-amber-700 font-black text-xl text-center" value={form.damage} onChange={e => setForm({...form, damage: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1">Descarte (kg)</label>
                    <input required type="number" step="0.01" placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition text-amber-700 font-black text-xl text-center" value={form.discard} onChange={e => setForm({...form, discard: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Lousa Dinâmica de Resultado */}
              <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl shadow-gray-900/20 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Peso Líquido Final</p>
                 <div className="flex items-end gap-2">
                   <span className="text-5xl font-black tracking-tighter text-emerald-400">{netWeight.toFixed(2)}</span>
                   <span className="text-xl font-bold text-gray-500 mb-1">kg</span>
                 </div>
                 <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between text-xs font-medium text-gray-400">
                    <span>Recebido: {received} kg</span>
                    <span>- Perdas: {damage + discard} kg</span>
                 </div>
              </div>

              {/* Bloco 3: Observações */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Observações da Conferência</label>
                  <textarea placeholder="Relate o estado da carga, motivos de descarte..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-gray-800 font-medium resize-none" value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} />
                </div>
              </div>

              {/* Bloco 4: Fotos (Obrigatório) */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">3</div>
                    <h3 className="font-bold text-gray-800">Fotos da Conferência</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 px-2 py-1 rounded-lg">Obrigatório</span>
                </div>
                
                <p className="text-xs text-gray-500 mb-4 font-medium">Tire fotos da carga na balança e evidências das avarias/descartes.</p>

                <label className="bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors w-full group">
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 mb-1 group-hover:scale-110 transition-transform">
                    <ImagePlus size={28} />
                  </div>
                  <span className="font-bold text-gray-700">Adicionar Fotos</span>
                </label>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {photos.map((photo, idx) => (
                       <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                         <img src={photo.preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <button type="button" onClick={() => removePhoto(idx)} className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1.5 shadow-md flex items-center justify-center">
                           <X size={14} />
                         </button>
                       </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botão de Submit */}
              <button 
                type="submit" 
                disabled={!form.receivedWeight || photos.length === 0}
                className="w-full bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-black text-lg py-5 rounded-2xl shadow-[0_8px_30px_rgb(37,99,235,0.3)] disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-8"
              >
                <CheckCircle2 size={24} /> 
                {!form.receivedWeight ? 'Informe a pesagem' : photos.length === 0 ? 'Adicione fotos' : 'Salvar Conferência'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- FINANCEIRO (PASSO 3) ----
export const UserFinanceiro = () => {
  const { loads, producers, updateLoad, currentUser } = useAgro();
  
  const pendingLoads = loads.filter(l => l.companyId === currentUser?.companyId && l.status === 'beneficiado');
  const [selectedLoadId, setSelectedLoadId] = useState('');
  
  const [form, setForm] = useState({ 
    pricePerKg: '', 
    discounts: '', 
    scheduledPaymentDate: '',
    observations: '' 
  });

  const hasPermission = currentUser?.permissions?.canManageFinancial;
  const selectedLoad = pendingLoads.find(l => l.id === selectedLoadId);

  // Variáveis calculadas em tempo real
  const netWeight = selectedLoad?.processing?.netWeight || 0;
  const price = Number(form.pricePerKg) || 0;
  const discounts = Number(form.discounts) || 0;
  
  const grossValue = netWeight * price;
  const finalValue = Math.max(0, grossValue - discounts);

  const closeForm = () => {
    setSelectedLoadId('');
    setForm({ pricePerKg: '', discounts: '', scheduledPaymentDate: '', observations: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoad || !hasPermission) return;

    updateLoad(selectedLoad.id, {
      status: 'pagamento_programado',
      financial: {
        id: `fin_${Date.now()}`,
        netWeight,
        pricePerKg: price,
        discounts,
        grossValue,
        finalValue,
        scheduledPaymentDate: form.scheduledPaymentDate,
        observations: form.observations
      }
    });
    
    toast.success('Fechamento financeiro concluído!');
    closeForm();
  };

  return (
    <div className="p-4 pb-24">
      {/* Cabeçalho da Lista */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Financeiro</h2>
        <p className="text-gray-500 text-sm">Fechamento e agenda de pagamentos</p>
      </div>

      {!hasPermission && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl mb-6 text-sm flex items-start gap-3 shadow-sm">
          <ShieldAlert size={20} className="shrink-0 mt-0.5" /> 
          <p>Você tem acesso <b>apenas para visualização</b>. O fechamento financeiro está bloqueado.</p>
        </div>
      )}

      {/* Lista de Cargas Pendentes (Apenas Status: Beneficiado) */}
      {pendingLoads.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-3xl border border-gray-100 border-dashed shadow-sm mt-10">
          <DollarSign size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1.5} />
          <h3 className="text-gray-800 font-bold mb-1">Nenhuma carga para fechar</h3>
          <p className="text-gray-500 text-sm">As cargas que passaram pelo barracão aparecerão aqui para cálculo do valor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingLoads.map(load => {
            const prod = producers.find(p => p.id === load.producerId);
            return (
              <div 
                key={load.id} 
                onClick={() => hasPermission && setSelectedLoadId(load.id)} 
                className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all group ${hasPermission ? 'cursor-pointer active:scale-95 hover:border-amber-200' : 'opacity-80 grayscale-[20%]'}`}
              >
                <div>
                  <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Aguardando Fechamento</p>
                  <p className="font-bold text-gray-800 leading-tight">{prod?.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px] font-bold">
                       {load.collection.type}
                     </span>
                     <span className="text-xs font-bold text-amber-600">
                       Líquido: {load.processing?.netWeight} kg
                     </span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${hasPermission ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {hasPermission ? <ArrowRight size={20} /> : <Lock size={18} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL / POP-UP MOBILE (FULL SCREEN) - Formulário do Financeiro */}
      {selectedLoadId && selectedLoad && hasPermission && (
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
          
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
               <Receipt className="text-amber-500" size={20} /> Fechar Pagamento
            </h2>
            <button onClick={closeForm} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-32 custom-scrollbar">
            
            {/* Resumo da Carga (Read-Only) */}
            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 mb-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Carga Beneficiada</p>
                  <h3 className="font-bold text-amber-900">{producers.find(p => p.id === selectedLoad.producerId)?.name}</h3>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Peso Líquido</p>
                   <p className="font-black text-xl text-amber-700">{netWeight} <span className="text-sm">kg</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-100/50 p-2 rounded-lg">
                <span>{selectedLoad.collection.type}</span> • 
                <span>Roça: {selectedLoad.collection.grossWeight} kg</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Bloco 1: Valores */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b border-gray-50 pb-3">
                   <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">1</div>
                   <h3 className="font-bold text-gray-800">Precificação</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1">Preço por kg (R$)</label>
                    <input required type="number" step="0.01" placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-emerald-700 font-black text-xl text-center" value={form.pricePerKg} onChange={e => setForm({...form, pricePerKg: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1">Descontos (R$)</label>
                    <input required type="number" step="0.01" placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition text-red-600 font-black text-xl text-center" value={form.discounts} onChange={e => setForm({...form, discounts: e.target.value})} />
                  </div>
                </div>

                {/* Subtotal Dinâmico */}
                {form.pricePerKg && (
                  <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center text-sm font-bold border border-gray-100 mt-2 text-gray-600">
                    <span>Valor Bruto Gerado:</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(grossValue)}</span>
                  </div>
                )}
              </div>

              {/* Lousa Dinâmica de Resultado Final */}
              <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl shadow-gray-900/20 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Valor Final a Pagar</p>
                 <div className="flex items-end gap-1 mt-2">
                   <span className="text-xl font-bold text-emerald-500 mb-1.5">R$</span>
                   <span className="text-5xl font-black tracking-tighter text-white">
                     {finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                 </div>
                 <div className="mt-5 pt-4 border-t border-gray-800 flex justify-between text-xs font-medium text-gray-400">
                    <span>Líquido: {netWeight} kg</span>
                    <span>Desc: R$ {discounts.toFixed(2)}</span>
                 </div>
              </div>

              {/* Bloco 2: Agendamento e Notas */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b border-gray-50 pb-3">
                   <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">2</div>
                   <h3 className="font-bold text-gray-800">Agendamento</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Data Programada para Pagamento</label>
                  <input required type="date" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition text-gray-800 font-bold" value={form.scheduledPaymentDate} onChange={e => setForm({...form, scheduledPaymentDate: e.target.value})} />
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Observações do Financeiro (Opcional)</label>
                  <textarea placeholder="Ex: Desconto referente a adiantamento..." rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition text-gray-800 font-medium resize-none" value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} />
                </div>
              </div>

              {/* Botão de Submit */}
              <button 
                type="submit" 
                disabled={!form.pricePerKg || !form.scheduledPaymentDate}
                className="w-full bg-amber-500 disabled:bg-gray-300 disabled:text-gray-500 text-white font-black text-lg py-5 rounded-2xl shadow-[0_8px_30px_rgb(245,158,11,0.3)] disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-8"
              >
                <CheckCircle2 size={24} /> Fechar Financeiro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- PERFIL DO USUÁRIO (PASSO 4) ----
export const UserPerfil = () => {
  const { currentUser, setCurrentUser } = useAgro();
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const getRoleName = (role: string | undefined) => {
    if (role === 'super_admin') return 'Super Administrador';
    if (role === 'admin') return 'Administrador';
    return 'Colaborador Operacional';
  };

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
          {getRoleName(currentUser?.role)}
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
        onClick={handleLogout}
        className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 active:scale-95 transition"
      >
        <LogOut size={20} /> Sair da Conta
      </button>
    </div>
  );
};