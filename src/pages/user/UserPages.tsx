import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAgro } from '../../contexts/AgroContext';
import { 
  CheckCircle2, ChevronRight, Factory, User, LogOut, DollarSign, 
  ShieldAlert, ImagePlus, X, Calendar, Clock, Plus, Truck, Scale, AlertTriangle, ArrowRight, Receipt, Lock,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

// ---- REDIRECIONAMENTO INTELIGENTE DA RAIZ DO APP ----
export const UserIndexRedirect = () => {
  const { currentUser } = useAgro();
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.permissions?.canCollect) return <Navigate to="/user/coleta" replace />;
  if (currentUser.permissions?.canProcess) return <Navigate to="/user/beneficiamento" replace />;
  if (currentUser.permissions?.canManageFinancial) return <Navigate to="/user/financeiro" replace />;
  return <Navigate to="/user/coleta" replace />;
};

// ==========================================
// COMPONENTES DE UI REUTILIZÁVEIS (PREMIUM)
// ==========================================

const PremiumCard = ({ children, onClick, className = '' }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white p-5 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-slate-100/50 transition-all ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
  >
    {children}
  </div>
);

const ReadOnlyBanner = ({ text }: { text: string }) => (
  <div className="bg-slate-900/5 backdrop-blur-md border border-slate-900/10 text-slate-700 p-4 rounded-3xl mb-8 flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
      <Lock size={16} className="text-slate-500" /> 
    </div>
    <div className="flex-1 mt-1">
      <p className="text-sm font-medium leading-relaxed">{text}</p>
    </div>
  </div>
);

const EmptyState = ({ icon: Icon, title, description, action }: any) => (
  <div className="text-center py-12 px-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-4">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
      <Icon size={32} className="text-slate-300" strokeWidth={1.5} />
    </div>
    <h3 className="text-xl text-slate-800 font-bold tracking-tight mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed mb-6">{description}</p>
    {action}
  </div>
);

const FloatingLabelInput = ({ label, type = "text", value, onChange, icon: Icon, required, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
    <div className="relative">
      {Icon && <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Icon size={18} className="text-slate-400" /></div>}
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        required={required}
        className={`w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl outline-none transition-all text-slate-800 font-medium ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5`}
        {...props}
      />
    </div>
  </div>
);

// ---- COLETA (PASSO 1) ----
export const UserColeta = () => {
  const { producers, currentUser, loads, addLoad } = useAgro();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ producerId: '', location: '', category: 'Frutas', type: '', boxes: '', grossWeight: '', loaderName: '', observations: '' });
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

  const visibleLoads = loads.filter(l => l.companyId === currentUser?.companyId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files).map(file => ({ file, preview: URL.createObjectURL(file) }));
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
    
    const photosEvidence = photos.map((p, i) => ({ id: `photo_${Date.now()}_${i}`, url: p.preview, type: 'collection' as const }));
    const nowIso = new Date().toISOString();

    addLoad({
      id: `load_${Date.now()}`,
      companyId: currentUser?.companyId || '',
      producerId: form.producerId,
      status: 'coletado',
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
    });
    
    toast.success('Carga registrada com sucesso!', { style: { borderRadius: '16px', padding: '16px' } });
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'coletado': return <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-sm">No Barracão</span>;
      case 'beneficiado': return <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-sm">Beneficiado</span>;
      case 'pagamento_programado': return <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-sm">A Pagar</span>;
      case 'pago': return <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-sm">Concluído</span>;
      default: return null;
    }
  };

  return (
    <div className="p-4">
      <div className="mb-8">
        <h2 className="text-[28px] font-black text-slate-900 tracking-tight">Coletas Registradas</h2>
        <p className="text-slate-500 font-medium">Fluxo de cargas em campo</p>
      </div>

      {!hasPermission ? (
        <ReadOnlyBanner text="Você está no modo de visualização. Apenas usuários autorizados podem registrar novas coletas." />
      ) : (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-3xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 mb-8"
        >
          <div className="bg-white/20 p-1.5 rounded-full"><Plus size={20} /></div>
          Registrar Coleta
        </button>
      )}

      <div className="space-y-4">
        {visibleLoads.length === 0 ? (
          <EmptyState 
            icon={Truck} 
            title="Nenhuma coleta" 
            description={hasPermission ? 'Comece registrando a primeira carga vinda da roça.' : 'Nenhuma carga foi registrada na plataforma ainda.'} 
          />
        ) : (
          visibleLoads.map(load => {
            const prod = producers.find(p => p.id === load.producerId);
            const isMyLoad = load.collection.responsibleId === currentUser?.id;

            return (
              <PremiumCard key={load.id} className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-white rounded-bl-full -z-10"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">ID: {load.id.slice(-6)}</p>
                      {isMyLoad && <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Meu Registro</span>}
                    </div>
                    <p className="text-lg font-bold text-slate-800 leading-tight truncate">{prod?.name}</p>
                  </div>
                  <div className="shrink-0 flex items-start">
                    {getStatusBadge(load.status)}
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-2xl p-4 flex justify-between items-center mb-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-white text-slate-700 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm border border-slate-100">
                       {load.collection.type.charAt(0)}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-slate-700">{load.collection.type}</p>
                       <p className="text-xs font-medium text-slate-500">{load.collection.boxes} cx • <span className="text-slate-700 font-bold">{load.collection.grossWeight} kg</span></p>
                     </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(load.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14}/> {new Date(load.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  {/* Ponto pulsante extra para destacar atividades bem recentes/pendentes de ação da próxima etapa */}
                  {load.status === 'coletado' && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse"></span>}
                </div>
              </PremiumCard>
            )
          })
        )}
      </div>

      {/* FULL SCREEN MODAL */}
      {isModalOpen && hasPermission && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-10">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Nova Coleta</h2>
            <button onClick={resetForm} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-32">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
              
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">1</div>
                   <h3 className="font-bold text-slate-800 text-lg">Origem</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Data</span>
                    <span className="font-bold text-slate-700">{currentDateTime.toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Hora</span>
                    <span className="font-bold text-slate-700">{currentDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Produtor Rural *</label>
                  <select required className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl px-4 py-4 outline-none transition-all text-slate-800 font-medium appearance-none" value={form.producerId} onChange={e => setForm({...form, producerId: e.target.value})}>
                    <option value="">Selecione...</option>
                    {producers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <FloatingLabelInput label="Local Exato" placeholder="Talhão, Lote, Gleba..." value={form.location} onChange={(e:any) => setForm({...form, location: e.target.value})} required />
              </div>

              <div className="h-px bg-slate-100 my-8"></div>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">2</div>
                   <h3 className="font-bold text-slate-800 text-lg">Carga</h3>
                </div>

                <FloatingLabelInput label="Variedade do Produto" placeholder="Ex: Tomate Carmem" value={form.type} onChange={(e:any) => setForm({...form, type: e.target.value})} required />

                <div className="grid grid-cols-2 gap-4">
                  <FloatingLabelInput label="Qtd. Caixas" type="number" placeholder="0" value={form.boxes} onChange={(e:any) => setForm({...form, boxes: e.target.value})} required className="text-center font-black text-xl" />
                  <FloatingLabelInput label="Peso Bruto (kg)" type="number" step="0.01" placeholder="0.00" value={form.grossWeight} onChange={(e:any) => setForm({...form, grossWeight: e.target.value})} required className="text-center font-black text-emerald-600 text-xl" />
                </div>
              </div>

              <div className="h-px bg-slate-100 my-8"></div>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">3</div>
                   <h3 className="font-bold text-slate-800 text-lg">Evidências</h3>
                </div>
                
                <label className="bg-slate-50 border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.98] w-full">
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 mb-1">
                    <Camera size={32} strokeWidth={1.5} />
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-slate-700 block text-lg">Tirar Fotos</span>
                    <span className="text-sm text-slate-400 font-medium">Obrigatório para auditoria</span>
                  </div>
                </label>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo, idx) => (
                       <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group border border-slate-100">
                         <img src={photo.preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/20"></div>
                         <button type="button" onClick={() => removePhoto(idx)} className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-slate-800 rounded-full p-1.5 shadow-sm">
                           <X size={14} strokeWidth={3} />
                         </button>
                       </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fixed Bottom Button Area */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pb-8">
                <button 
                  type="submit" 
                  disabled={photos.length === 0}
                  className="w-full max-w-md mx-auto bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-lg py-5 rounded-[2rem] shadow-[0_8px_30px_rgb(16,185,129,0.3)] disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  {photos.length === 0 ? 'Adicione fotos para salvar' : 'Concluir Registro'}
                </button>
              </div>
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
  const [form, setForm] = useState({ receivedWeight: '', damage: '', discard: '', observations: '' });

  const hasPermission = currentUser?.permissions?.canProcess;
  const selectedLoad = pendingLoads.find(l => l.id === selectedLoadId);

  const fieldWeight = selectedLoad?.collection.grossWeight || 0;
  const received = Number(form.receivedWeight) || 0;
  const damage = Number(form.damage) || 0;
  const discard = Number(form.discard) || 0;
  const netWeight = Math.max(0, received - damage - discard);
  const diffWeight = received - fieldWeight;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotos(prev => [...prev, ...Array.from(e.target.files!).map(file => ({ file, preview: URL.createObjectURL(file) }))]);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoad || !hasPermission) return;
    const photosEvidence = photos.map((p, i) => ({ id: `photo_${Date.now()}_${i}`, url: p.preview, type: 'processing' as const }));

    updateLoad(selectedLoad.id, {
      status: 'beneficiado',
      processing: {
        id: `proc_${Date.now()}`, fieldWeight, receivedWeight: received, damage, discard, netWeight, weightDifference: diffWeight, observations: form.observations, photos: photosEvidence
      }
    });
    
    toast.success('Beneficiamento concluído!');
    setSelectedLoadId(''); setForm({ receivedWeight: '', damage: '', discard: '', observations: '' }); setPhotos([]);
  };

  return (
    <div className="p-4">
      <div className="mb-8">
        <h2 className="text-[28px] font-black text-slate-900 tracking-tight">Barracão</h2>
        <p className="text-slate-500 font-medium">Conferência de recebimento</p>
      </div>

      {!hasPermission && <ReadOnlyBanner text="Modo leitura. Você não tem permissão para realizar as conferências no barracão." />}

      {pendingLoads.length === 0 ? (
        <EmptyState icon={Factory} title="Pátio Limpo" description="Não há cargas aguardando conferência no momento." />
      ) : (
        <div className="space-y-4">
          {pendingLoads.map(load => {
            const prod = producers.find(p => p.id === load.producerId);
            return (
              <PremiumCard 
                key={load.id} 
                onClick={() => hasPermission && setSelectedLoadId(load.id)} 
                className={`flex items-center justify-between group ${!hasPermission ? 'opacity-70' : 'hover:border-blue-200'}`}
              >
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest uppercase">Aguardando Peso</p>
                  <p className="text-lg font-bold text-slate-800 leading-tight">{prod?.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[11px] font-bold">{load.collection.type}</span>
                     <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Roça: {load.collection.grossWeight} kg</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${hasPermission ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-active:scale-95' : 'bg-slate-50 text-slate-400'}`}>
                  {hasPermission ? <ArrowRight size={20} strokeWidth={2.5} /> : <Lock size={18} />}
                </div>
              </PremiumCard>
            );
          })}
        </div>
      )}

      {selectedLoadId && selectedLoad && hasPermission && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-10">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Conferência</h2>
            <button onClick={() => setSelectedLoadId('')} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-32">
            <div className="max-w-md mx-auto">
              
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 mb-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Carga de Origem</p>
                <h3 className="font-black text-2xl mb-4">{producers.find(p => p.id === selectedLoad.producerId)?.name}</h3>
                <div className="flex justify-between items-end border-t border-white/20 pt-4">
                   <div>
                     <p className="text-blue-200 text-xs font-medium mb-1">{selectedLoad.collection.type}</p>
                     <p className="font-bold">{selectedLoad.collection.boxes} Caixas</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Peso Roça</p>
                     <p className="font-black text-2xl">{fieldWeight} <span className="text-sm font-medium">kg</span></p>
                   </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-2">Pesagem Real</h3>
                  <FloatingLabelInput label="Peso na Balança (kg)" type="number" step="0.01" value={form.receivedWeight} onChange={(e:any) => setForm({...form, receivedWeight: e.target.value})} required className="text-center font-black text-2xl text-blue-600" />
                  
                  {form.receivedWeight && (
                    <div className={`p-4 rounded-2xl flex justify-between items-center text-sm font-bold border ${diffWeight < 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                      <span>Diferença apurada:</span>
                      <span className="text-lg">{diffWeight > 0 ? '+' : ''}{diffWeight.toFixed(2)} kg</span>
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-100 my-8"></div>

                <div className="space-y-5">
                  <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-2">Quebras e Perdas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FloatingLabelInput label="Avarias (kg)" type="number" step="0.01" value={form.damage} onChange={(e:any) => setForm({...form, damage: e.target.value})} className="text-center font-black text-xl text-amber-600" />
                    <FloatingLabelInput label="Descarte (kg)" type="number" step="0.01" value={form.discard} onChange={(e:any) => setForm({...form, discard: e.target.value})} className="text-center font-black text-xl text-amber-600" />
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden mt-8">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Resultado Líquido</p>
                   <div className="flex items-end gap-2">
                     <span className="text-5xl font-black tracking-tighter text-white">{netWeight.toFixed(2)}</span>
                     <span className="text-xl font-bold text-slate-500 mb-1">kg</span>
                   </div>
                </div>

                <div className="h-px bg-slate-100 my-8"></div>

                <div className="space-y-5">
                  <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-2 flex justify-between items-center">
                    Fotos da Balança <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-lg uppercase tracking-wider">Obrigatório</span>
                  </h3>
                  <label className="bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.98] w-full">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-500 mb-1">
                      <Camera size={32} strokeWidth={1.5} />
                    </div>
                    <span className="font-bold text-slate-700 text-lg">Adicionar Evidências</span>
                  </label>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {photos.map((photo, idx) => (
                         <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                           <img src={photo.preview} alt="preview" className="w-full h-full object-cover" />
                           <button type="button" onClick={() => removePhoto(idx)} className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm"><X size={14}/></button>
                         </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pb-8">
                  <button type="submit" disabled={!form.receivedWeight || photos.length === 0} className="w-full max-w-md mx-auto bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-lg py-5 rounded-[2rem] shadow-[0_8px_30px_rgb(37,99,235,0.3)] disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    Concluir Conferência
                  </button>
                </div>
              </form>
            </div>
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
  const [form, setForm] = useState({ pricePerKg: '', discounts: '', scheduledPaymentDate: '' });

  const hasPermission = currentUser?.permissions?.canManageFinancial;
  const selectedLoad = pendingLoads.find(l => l.id === selectedLoadId);

  const netWeight = selectedLoad?.processing?.netWeight || 0;
  const price = Number(form.pricePerKg) || 0;
  const discounts = Number(form.discounts) || 0;
  const grossValue = netWeight * price;
  const finalValue = Math.max(0, grossValue - discounts);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoad || !hasPermission) return;

    updateLoad(selectedLoad.id, {
      status: 'pagamento_programado',
      financial: { id: `fin_${Date.now()}`, netWeight, pricePerKg: price, discounts, grossValue, finalValue, scheduledPaymentDate: form.scheduledPaymentDate }
    });
    
    toast.success('Fechamento concluído!');
    setSelectedLoadId(''); setForm({ pricePerKg: '', discounts: '', scheduledPaymentDate: '' });
  };

  return (
    <div className="p-4">
      <div className="mb-8">
        <h2 className="text-[28px] font-black text-slate-900 tracking-tight">Acertos</h2>
        <p className="text-slate-500 font-medium">Lançamento de valores e pagamentos</p>
      </div>

      {!hasPermission && <ReadOnlyBanner text="Modo leitura. O fechamento financeiro é restrito a perfis autorizados." />}

      {pendingLoads.length === 0 ? (
        <EmptyState icon={Receipt} title="Tudo em dia" description="Nenhuma carga aguardando precificação no momento." />
      ) : (
        <div className="space-y-4">
          {pendingLoads.map(load => {
            const prod = producers.find(p => p.id === load.producerId);
            return (
              <PremiumCard 
                key={load.id} 
                onClick={() => hasPermission && setSelectedLoadId(load.id)} 
                className={`flex items-center justify-between group ${!hasPermission ? 'opacity-70' : 'hover:border-slate-800'}`}
              >
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest uppercase">Pendente</p>
                  <p className="text-lg font-bold text-slate-800 leading-tight">{prod?.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[11px] font-bold">{load.collection.type}</span>
                     <span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">Líquido: {load.processing?.netWeight} kg</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${hasPermission ? 'bg-slate-900 text-white shadow-md group-active:scale-95' : 'bg-slate-50 text-slate-400'}`}>
                  {hasPermission ? <ArrowRight size={20} strokeWidth={2.5} /> : <Lock size={18} />}
                </div>
              </PremiumCard>
            );
          })}
        </div>
      )}

      {selectedLoadId && selectedLoad && hasPermission && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-10">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Fechamento</h2>
            <button onClick={() => setSelectedLoadId('')} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-32">
            <div className="max-w-md mx-auto">
              
              <div className="bg-slate-50 rounded-[2rem] p-6 mb-8 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Carga Beneficiada</p>
                <h3 className="font-black text-2xl text-slate-800 mb-4">{producers.find(p => p.id === selectedLoad.producerId)?.name}</h3>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                   <div className="text-sm font-bold text-slate-600">{selectedLoad.collection.type}</div>
                   <div className="bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 font-black text-slate-800">
                     {netWeight} kg
                   </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-2">Valores</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FloatingLabelInput label="Preço (R$/kg)" type="number" step="0.01" value={form.pricePerKg} onChange={(e:any) => setForm({...form, pricePerKg: e.target.value})} required className="text-center font-black text-2xl text-slate-800" />
                    <FloatingLabelInput label="Descontos (R$)" type="number" step="0.01" value={form.discounts} onChange={(e:any) => setForm({...form, discounts: e.target.value})} className="text-center font-black text-2xl text-red-500" />
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden mt-8">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total a Pagar</p>
                   <div className="flex items-start gap-1">
                     <span className="text-2xl font-bold text-emerald-400 mt-1">R$</span>
                     <span className="text-6xl font-black tracking-tighter text-white">
                       {finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </span>
                   </div>
                </div>

                <div className="space-y-5 pt-4">
                  <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-2">Agendamento</h3>
                  <FloatingLabelInput label="Data do Pagamento" type="date" value={form.scheduledPaymentDate} onChange={(e:any) => setForm({...form, scheduledPaymentDate: e.target.value})} required className="font-bold text-slate-800" />
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pb-8">
                  <button type="submit" disabled={!form.pricePerKg || !form.scheduledPaymentDate} className="w-full max-w-md mx-auto bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-lg py-5 rounded-[2rem] shadow-[0_8px_30px_rgb(15,23,42,0.3)] disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    Confirmar Acerto
                  </button>
                </div>
              </form>
            </div>
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

  return (
    <div className="p-4 pb-32">
      <div className="mb-8 text-center pt-8">
        <div className="w-28 h-28 bg-gradient-to-tr from-slate-100 to-white text-slate-800 font-black text-4xl flex items-center justify-center rounded-full mx-auto mb-5 shadow-xl shadow-slate-200/50 border-4 border-white">
          {currentUser?.name.charAt(0)}
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{currentUser?.name}</h2>
        <p className="text-slate-500 font-medium">{currentUser?.email}</p>
        <span className="inline-block mt-4 px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
          {currentUser?.role === 'admin' ? 'Administrador' : 'Colaborador Operacional'}
        </span>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6">
        <h4 className="font-black text-slate-800 mb-4 text-lg">Meu Acesso</h4>
        <div className="space-y-4">
          {[
            { label: 'Coleta na Roça', allowed: currentUser?.permissions?.canCollect },
            { label: 'Conferência no Barracão', allowed: currentUser?.permissions?.canProcess },
            { label: 'Lançamentos Financeiros', allowed: currentUser?.permissions?.canManageFinancial },
          ].map((perm, i) => (
            <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-sm font-bold text-slate-700">{perm.label}</span>
              {perm.allowed ? (
                <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full"><CheckCircle2 size={16} strokeWidth={3} /></div>
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