import React, { useState } from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Calendar, Clock, Plus, Truck, Camera, Package, X } from 'lucide-react';
import { toast } from 'sonner';
import { PremiumCard, ReadOnlyBanner, EmptyState, FloatingLabelInput } from '../../components/shared/UserUIComponents';
import { uploadImage } from '../../lib/storage';

const UserColeta = () => {
  const { producers, products, currentUser, loads, addLoad } = useAgro();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const [form, setForm] = useState({ 
    producerId: '', location: '', category: 'Frutas', type: '', boxes: '', grossWeight: '', loaderName: '', observations: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  });

  const hasPermission = currentUser?.permissions?.canCollect;

  const visibleLoads = loads.filter(l => l.companyId === currentUser?.companyId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const file = e.target.files[0];
        const base64 = await uploadImage(file);
        setPhotos(prev => [...prev, base64]);
        toast.success('Foto adicionada!');
      } catch (error) {
        toast.error('Erro ao processar imagem');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newArr = [...prev];
      newArr.splice(index, 1);
      return newArr;
    });
  };

  const openModal = () => {
    setForm(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }));
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setForm({ 
      producerId: '', location: '', category: 'Frutas', type: '', boxes: '', grossWeight: '', loaderName: '', observations: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
    setPhotos([]);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission) return;
    
    setIsUploading(true);
    try {
      const photosEvidence = photos.map((url, i) => ({ id: `photo_${Date.now()}_${i}`, url, type: 'collection' as const }));
      
      const combinedDate = new Date(`${form.date}T${form.time}:00`);
      const nowIso = isNaN(combinedDate.getTime()) ? new Date().toISOString() : combinedDate.toISOString();

      await addLoad({
        id: crypto.randomUUID(),
        companyId: currentUser?.companyId || '',
        producerId: form.producerId,
        status: 'coletado',
        createdAt: nowIso,
        updatedAt: nowIso,
        collection: {
          id: crypto.randomUUID(),
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
    } catch (err: any) {
      toast.error(err.message || 'Erro ao registrar carga. Verifique sua conexão e tente novamente.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'coletado': return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-sm">No Barracão</span>;
      case 'beneficiado': return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-sm">Beneficiado</span>;
      case 'pagamento_programado': return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-sm">A Pagar</span>;
      case 'pago': return <span className="bg-brand-soft text-brand border border-brand-soft px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-sm">Concluído</span>;
      default: return null;
    }
  };

  return (
    <div className="p-4">
      <div className="mb-8">
        <h2 className="text-[28px] font-black text-brand tracking-tight">Coletas Registradas</h2>
        <p className="opacity-60 font-medium tracking-tight">Fluxo de cargas em campo</p>
      </div>

      {!hasPermission ? (
        <ReadOnlyBanner text="Você está no modo de visualização. Apenas usuários autorizados podem registrar novas coletas." />
      ) : (
        <button 
          onClick={openModal}
          className="w-full btn-brand text-white font-black text-lg py-5 rounded-[2rem] active:scale-95 transition-all flex items-center justify-center gap-3 mb-8"
        >
          <div className="bg-white/20 p-1.5 rounded-full"><Plus size={20} /></div>
          Registrar Coleta
        </button>
      )}

      <div className="space-y-6">
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
            const product = products.find(p => p.name.toLowerCase() === load.collection.type.toLowerCase());

            return (
              <PremiumCard 
                key={load.id} 
                className="relative overflow-hidden group border border-slate-200 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.25)] hover:shadow-[0_16px_48px_-12px_rgba(15,23,42,0.3)]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-white rounded-bl-full -z-10"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] font-bold opacity-30 tracking-widest uppercase">ID: {load.id.slice(-6)}</p>
                      {isMyLoad && <span className="bg-brand-soft text-brand text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Meu Registro</span>}
                    </div>
                    <p className="text-lg font-black text-brand leading-tight truncate">{prod?.name}</p>
                  </div>
                  <div className="shrink-0 flex items-start">
                    {getStatusBadge(load.status)}
                  </div>
                </div>

                <div className="bg-brand-soft/50 rounded-2xl p-4 flex justify-between items-center mb-4 border border-brand-soft">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-white text-brand rounded-xl flex items-center justify-center font-bold text-sm shadow-sm border border-brand-soft overflow-hidden shrink-0">
                       {product?.imageUrl ? (
                         <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                       ) : (
                         <Package size={20} className="opacity-30" />
                       )}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-brand">{load.collection.type}</p>
                       <p className="text-xs font-bold opacity-60">{load.collection.boxes} cx • <span className="text-brand font-black">{load.collection.grossWeight} kg</span></p>
                     </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-xs font-bold opacity-40">
                    <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(load.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14}/> {new Date(load.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  {load.status === 'coletado' && <span className="w-2.5 h-2.5 rounded-full bg-brand shadow-md animate-pulse" style={{ boxShadow: '0 0 10px var(--primary-color)' }}></span>}
                </div>
              </PremiumCard>
            )
          })
        )}
      </div>

      {/* FULL SCREEN MODAL */}
      {isModalOpen && hasPermission && (
        <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-10">
            <h2 className="text-lg font-black text-brand tracking-tight">Nova Coleta</h2>
            <button onClick={resetForm} className="w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-brand transition-colors text-slate-400">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-32">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
              
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">1</div>
                   <h3 className="font-black text-brand text-lg">Origem</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white hover:bg-slate-50/50 rounded-2xl p-3.5 border-[1.5px] border-slate-100 transition-colors shadow-sm">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">Data</span>
                      <button 
                        type="button" 
                        onClick={() => setForm({...form, date: new Date().toISOString().split('T')[0]})}
                        className="text-[9px] bg-brand-soft text-brand px-2 py-1 rounded-md font-black uppercase tracking-wider active:scale-95 transition-transform"
                      >
                        Hoje
                      </button>
                    </div>
                    <input 
                      type="date" 
                      required
                      value={form.date}
                      onChange={e => setForm({...form, date: e.target.value})}
                      className="w-full bg-transparent font-bold text-agro-forest outline-none px-1"
                    />
                  </div>

                  <div className="bg-white hover:bg-slate-50/50 rounded-2xl p-3.5 border-[1.5px] border-slate-100 transition-colors shadow-sm">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">Hora</span>
                      <button 
                        type="button" 
                        onClick={() => setForm({...form, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})}
                        className="text-[9px] bg-brand-soft text-brand px-2 py-1 rounded-md font-black uppercase tracking-wider active:scale-95 transition-transform"
                      >
                        Agora
                      </button>
                    </div>
                    <input 
                      type="time" 
                      required
                      value={form.time}
                      onChange={e => setForm({...form, time: e.target.value})}
                      className="w-full bg-transparent font-bold text-brand outline-none px-1"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand/70 uppercase tracking-widest ml-1">Produtor Rural *</label>
                  <select 
                    required 
                    className="w-full bg-white border-[1.5px] border-slate-100 focus:border-brand focus:ring-4 focus:ring-brand/15 rounded-2xl px-4 py-4 outline-none transition-all text-brand font-bold appearance-none shadow-sm" 
                    value={form.producerId} 
                    onChange={e => {
                      const selectedId = e.target.value;
                      const selectedProd = producers.find(p => p.id === selectedId);
                      setForm({
                        ...form, 
                        producerId: selectedId,
                        location: selectedProd ? selectedProd.property : ''
                      });
                    }}
                  >
                    <option value="">Selecione...</option>
                    {producers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <FloatingLabelInput label="Local Exato" placeholder="Talhão, Lote, Gleba..." value={form.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, location: e.target.value})} required />
              </div>

              <div className="h-px bg-agro-stone/50 my-8"></div>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">2</div>
                   <h3 className="font-black text-brand text-lg">Carga</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold opacity-70 uppercase tracking-widest ml-1">Variedade do Produto *</label>
                  <select 
                    required 
                    className="w-full bg-white border-[1.5px] border-slate-100 focus:border-brand ring-brand focus:ring-4 rounded-2xl px-4 py-4 outline-none transition-all text-brand font-bold appearance-none shadow-sm" 
                    value={form.type} 
                    onChange={e => setForm({
                      ...form, 
                      type: e.target.value, 
                      category: products.find(p => p.name === e.target.value)?.category || form.category
                    })}
                  >
                    <option value="">Selecione...</option>
                    {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FloatingLabelInput label="Qtd. Caixas" type="number" placeholder="0" value={form.boxes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, boxes: e.target.value})} required />
                  <FloatingLabelInput label="Peso Bruto (kg)" type="number" step="0.01" placeholder="0.00" value={form.grossWeight} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, grossWeight: e.target.value})} required />
                </div>
              </div>

              <div className="h-px bg-agro-stone/50 my-8"></div>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">3</div>
                   <h3 className="font-black text-brand text-lg">Evidências</h3>
                </div>
                
                <label className="bg-white border-2 border-dashed border-slate-200 hover:border-brand rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.98] w-full shadow-sm">
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  <div className="w-16 h-16 bg-brand-soft rounded-2xl shadow-inner border border-brand-soft flex items-center justify-center text-brand opacity-20 mb-1">
                    {isUploading ? (
                      <div className="w-8 h-8 border-4 border-brand-soft border-t-brand rounded-full animate-spin"></div>
                    ) : (
                      <Camera size={32} strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="text-center">
                    <span className="font-black text-brand block text-lg">{isUploading ? 'Processando...' : 'Tirar Fotos'}</span>
                    <span className="text-sm opacity-60 font-bold">Obrigatório para auditoria</span>
                  </div>
                </label>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo, idx) => (
                       <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group border border-slate-100">
                         <img src={photo} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/20"></div>
                         <button type="button" onClick={() => removePhoto(idx)} className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-slate-800 rounded-full p-1.5 shadow-sm">
                           <X size={14} strokeWidth={3} />
                         </button>
                       </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pb-8">
                <button 
                  type="submit" 
                  disabled={photos.length === 0 || isUploading}
                  className="w-full max-w-md mx-auto btn-brand disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white font-black text-lg py-5 rounded-[2rem] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  {isUploading ? 'Processando imagens...' : photos.length === 0 ? 'Adicione fotos para salvar' : 'Concluir Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserColeta;
