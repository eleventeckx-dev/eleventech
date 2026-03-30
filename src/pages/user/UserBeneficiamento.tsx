import React, { useState } from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Factory, Package, ArrowRight, Lock, Camera, X, Leaf, Warehouse, ShoppingCart, Cog, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { PremiumCard, ReadOnlyBanner, EmptyState, FloatingLabelInput } from '../../components/shared/UserUIComponents';
import { uploadImage } from '../../lib/storage';

const UserBeneficiamento = () => {
  const { loads, producers, products, updateLoad, currentUser } = useAgro();
  
  const pendingLoads = loads.filter(l => l.companyId === currentUser?.companyId && l.status === 'coletado');
  const [selectedLoadId, setSelectedLoadId] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({ 
    receivedWeight: '', damage: '', discard: '', greenWeight: '',
    stockWeight: '', productionWeight: '', bulkSaleWeight: '',
    observations: '' 
  });

  const hasPermission = currentUser?.permissions?.canProcess;
  const selectedLoad = pendingLoads.find(l => l.id === selectedLoadId);
  const selectedProduct = selectedLoad ? products.find(p => p.name.toLowerCase() === selectedLoad.collection.type.toLowerCase()) : null;

  const fieldWeight = selectedLoad?.collection.grossWeight || 0;
  const received = Number(form.receivedWeight) || 0;
  const damage = Number(form.damage) || 0;
  const discard = Number(form.discard) || 0;
  const greenWeight = Number(form.greenWeight) || 0;
  const netWeight = Math.max(0, received - damage - discard);
  const diffWeight = received - fieldWeight;

  const stockW = Number(form.stockWeight) || 0;
  const productionW = Number(form.productionWeight) || 0;
  const bulkW = Number(form.bulkSaleWeight) || 0;
  const totalDestination = stockW + productionW + bulkW;
  const isDestinationValid = netWeight > 0 && Math.abs(netWeight - totalDestination) < 0.01;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoad || !hasPermission || !isDestinationValid) return;
    const photosEvidence = photos.map((url, i) => ({ id: `photo_${Date.now()}_${i}`, url, type: 'processing' as const }));

    updateLoad(selectedLoad.id, {
      status: 'beneficiado',
      processing: {
        id: `proc_${Date.now()}`, fieldWeight, receivedWeight: received, damage, discard, greenWeight,
        netWeight, weightDifference: diffWeight,
        stockWeight: stockW, productionWeight: productionW, bulkSaleWeight: bulkW,
        observations: form.observations, photos: photosEvidence
      }
    });
    
    toast.success('Beneficiamento concluído!');
    setSelectedLoadId('');
    setForm({ receivedWeight: '', damage: '', discard: '', greenWeight: '', stockWeight: '', productionWeight: '', bulkSaleWeight: '', observations: '' });
    setPhotos([]);
  };


  return (
    <div className="p-4">
      <div className="mb-8">
        <h2 className="text-[28px] font-black text-brand tracking-tight">Beneficiamento</h2>
        <p className="opacity-60 font-medium tracking-tight">Conferência de recebimento</p>
      </div>

      {!hasPermission && <ReadOnlyBanner text="Modo leitura. Você não tem permissão para realizar as conferências no beneficiamento." />}

      {pendingLoads.length === 0 ? (
        <EmptyState icon={Factory} title="Pátio Limpo" description="Não há cargas aguardando conferência no momento." /> ) : (
        <div className="space-y-4">
          {pendingLoads.map(load => {
            const prod = producers.find(p => p.id === load.producerId);
            const product = products.find(p => p.name.toLowerCase() === load.collection.type.toLowerCase());
            
            return (
              <PremiumCard 
                key={load.id} 
                onClick={() => hasPermission && setSelectedLoadId(load.id)} 
                className={`flex items-center justify-between group border border-slate-100 shadow-sm ${!hasPermission ? 'opacity-70' : 'hover:border-brand-soft'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-soft text-brand rounded-xl flex items-center justify-center overflow-hidden border border-brand-soft shrink-0 shadow-inner">
                    {product?.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="opacity-30" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold opacity-30 mb-0.5 tracking-widest uppercase">Aguardando Peso</p>
                    <p className="text-lg font-black text-brand leading-tight">{prod?.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                       <span className="bg-brand-soft text-brand px-2 py-0.5 rounded-lg text-[10px] font-bold border border-brand-soft">{load.collection.type}</span>
                       <span className="text-[10px] font-black text-brand bg-brand-soft px-2 py-0.5 rounded-lg">Roça: {load.collection.grossWeight} kg</span>
                    </div>
                  </div>
                </div>
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${hasPermission ? 'bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white group-active:scale-95' : 'bg-slate-50 text-slate-300'}`}>
                  {hasPermission ? <ArrowRight size={18} strokeWidth={2.5} /> : <Lock size={16} />}
                </div>
              </PremiumCard>
            );
          })}
        </div>
      )}

      {selectedLoadId && selectedLoad && hasPermission && (
        <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col animate-in slide-in-from-bottom-full duration-300 overflow-hidden">
          <div className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-10">
            <h2 className="text-lg font-black text-brand tracking-tight">Conferência</h2>
            <button onClick={() => setSelectedLoadId('')} className="w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-brand transition-colors text-slate-400">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-32">
            <div className="max-w-md mx-auto">
              
              {/* Card de Origem */}
              <div className="btn-brand rounded-[2rem] p-6 mb-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Carga de Origem</p>
                <h3 className="font-black text-2xl mb-4 text-white uppercase tracking-tight">{producers.find(p => p.id === selectedLoad.producerId)?.name}</h3>
                <div className="flex justify-between items-end border-t border-white/10 pt-4">
                   <div className="flex items-center gap-3">
                     {selectedProduct?.imageUrl ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 shrink-0">
                          <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                        </div>
                     ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                          <Package size={18} className="text-white/80" />
                        </div>
                     )}
                     <div>
                       <p className="text-white/70 text-xs font-bold mb-0.5 leading-none">{selectedLoad.collection.type}</p>
                       <p className="font-bold text-sm leading-none text-white">{selectedLoad.collection.boxes} Caixas</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Peso Roça</p>
                     <p className="font-black text-2xl leading-none text-white">{fieldWeight} <span className="text-xs font-bold text-white/80">kg</span></p>
                   </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seção 1: Pesagem */}
                <div className="space-y-5">
                  <h3 className="font-black text-brand text-lg border-b border-slate-100 pb-2">Pesagem Real</h3>
                  <FloatingLabelInput label="Peso na Balança (kg)" type="number" step="0.01" value={form.receivedWeight} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, receivedWeight: e.target.value})} required />
                  
                  {form.receivedWeight && (
                    <div className={`p-4 rounded-2xl flex justify-between items-center text-sm font-bold border transition-all ${diffWeight < 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-brand-soft text-brand border-brand-soft'}`}>
                      <span>Diferença apurada:</span>
                      <span className="text-lg">{diffWeight > 0 ? '+' : ''}{diffWeight.toFixed(2)} kg</span>
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-100 my-8"></div>

                {/* Seção 2: Quebras e Perdas */}
                <div className="space-y-5">
                  <h3 className="font-black text-brand text-lg border-b border-slate-100 pb-2">Quebras e Perdas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FloatingLabelInput label="Avarias (kg)" type="number" step="0.01" value={form.damage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, damage: e.target.value})} />
                    <FloatingLabelInput label="Descarte (kg)" type="number" step="0.01" value={form.discard} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, discard: e.target.value})} />
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-8"></div>

                {/* Seção 3: Classificação — Verde */}
                <div className="space-y-5">
                  <h3 className="font-black text-brand text-lg border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Leaf size={18} className="text-brand" /> Classificação
                  </h3>
                  <FloatingLabelInput label="Produtos Verdes (kg)" type="number" step="0.01" value={form.greenWeight} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, greenWeight: e.target.value})} icon={Leaf} />
                  <p className="text-xs font-bold opacity-30 -mt-2">Informe a quantidade de produtos que ainda não estão maduros. Informativo.</p>
                </div>

                {/* Card Resultado Líquido */}
                <div className="btn-brand rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden mt-8">
                   <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Resultado Líquido</p>
                   <div className="flex items-end gap-2">
                     <span className="text-5xl font-black tracking-tighter text-white">{netWeight.toFixed(2)}</span>
                     <span className="text-xl font-bold text-white/60 mb-1">kg</span>
                   </div>
                   {greenWeight > 0 && (
                     <div className="mt-3 flex items-center gap-2 text-xs font-bold text-white/80">
                       <Leaf size={14} /> {greenWeight.toFixed(1)} kg verde no lote
                     </div>
                   )}
                </div>

                <div className="h-px bg-slate-100 my-8"></div>

                {/* Seção 4: Destinação */}
                {netWeight > 0 && (
                  <div className="space-y-5">
                    <h3 className="font-black text-brand text-lg border-b border-slate-100 pb-2 flex items-center gap-2">
                      Destinação <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-lg uppercase tracking-wider font-black">Obrigatório</span>
                    </h3>
                    <p className="text-xs font-bold opacity-40 -mt-2">Distribua o peso líquido entre estoque, produção e/ou granel. O total deve bater com {netWeight.toFixed(2)} kg.</p>


                    <div className="space-y-4">
                      <div className="bg-brand-soft/50 border border-brand-soft rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-black text-brand uppercase tracking-wider">
                          <Warehouse size={16} /> Estoque (Maturação)
                        </div>
                        <FloatingLabelInput label="Peso para Estoque (kg)" type="number" step="0.01" value={form.stockWeight} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, stockWeight: e.target.value})} />
                      </div>

                      <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-black text-indigo-600 uppercase tracking-wider">
                          <Cog size={16} /> Produção (Financeiro)
                        </div>
                        <FloatingLabelInput label="Peso para Produção (kg)" type="number" step="0.01" value={form.productionWeight} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, productionWeight: e.target.value})} />
                      </div>

                      <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-black text-amber-600 uppercase tracking-wider">
                          <ShoppingCart size={16} /> Venda a Granel (Financeiro)
                        </div>
                        <FloatingLabelInput label="Peso para Granel (kg)" type="number" step="0.01" value={form.bulkSaleWeight} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, bulkSaleWeight: e.target.value})} />
                      </div>
                    </div>

                    {/* Validação visual */}
                    <div className={`p-4 rounded-2xl flex justify-between items-center text-sm font-black border transition-all ${
                      isDestinationValid 
                        ? 'bg-brand-soft text-brand border-brand-soft' 
                        : totalDestination > 0 
                          ? 'bg-red-50 text-red-600 border-red-100' 
                          : 'bg-white text-slate-400 border-slate-100'
                    }`}>
                      <span>Distribuído:</span>
                      <span className="text-lg">
                        {totalDestination.toFixed(2)} / {netWeight.toFixed(2)} kg
                        {isDestinationValid && ' ✓'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="h-px bg-slate-100 my-8"></div>

                {/* Seção 5: Fotos */}
                <div className="space-y-5">
                  <h3 className="font-black text-brand text-lg border-b border-slate-100 pb-2 flex justify-between items-center">
                    Fotos da Balança <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-lg uppercase tracking-wider">Obrigatório</span>
                  </h3>
                  <label className="bg-white border-2 border-dashed border-slate-200 hover:border-brand rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.98] w-full shadow-sm">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    <div className="w-16 h-16 bg-brand-soft rounded-2xl shadow-inner border border-brand-soft flex items-center justify-center text-brand opacity-20 mb-1">
                      {isUploading ? (
                        <div className="w-8 h-8 border-4 border-brand-soft border-t-brand rounded-full animate-spin"></div>
                      ) : (
                        <Camera size={32} strokeWidth={1.5} />
                      )}
                    </div>
                    <span className="font-black text-brand text-lg">{isUploading ? 'Processando...' : 'Adicionar Evidências'}</span>
                  </label>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {photos.map((photo, idx) => (
                         <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                           <img src={photo} alt="preview" className="w-full h-full object-cover" />
                           <button type="button" onClick={() => removePhoto(idx)} className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm text-red-600 hover:bg-white"><X size={14}/></button>
                         </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent pb-8">
                  <button type="submit" disabled={!form.receivedWeight || photos.length === 0 || !isDestinationValid || isUploading} className="w-full max-w-md mx-auto btn-brand disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-lg py-5 rounded-[2rem] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-none">
                    {isUploading ? 'Processando imagens...' : 'Concluir Conferência'}
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

export default UserBeneficiamento;
