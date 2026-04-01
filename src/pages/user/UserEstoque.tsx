import React, { useState } from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Warehouse, Package, Leaf, ArrowRightLeft, Cog, ShoppingCart, Lock as LockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ReadOnlyBanner, EmptyState, FloatingLabelInput } from '../../components/shared/UserUIComponents';

const UserEstoque = () => {
  const { loads, producers, products, updateLoad, currentUser } = useAgro();
  const [releaseModal, setReleaseModal] = useState<{ productName: string; available: number } | null>(null);
  const [releaseForm, setReleaseForm] = useState({ toProduction: '', toBulk: '' });

  const hasPermission = currentUser?.permissions?.canProcess;
  const companyLoads = loads.filter(l => l.companyId === currentUser?.companyId);

  // Cargas que possuem peso em estoque
  const stockLoads = companyLoads.filter(l => 
    l.processing && l.processing.stockWeight > 0
  );

  const totalStockWeight = stockLoads.reduce((acc, l) => acc + (l.processing?.stockWeight || 0), 0);
  const totalGreenWeight = stockLoads.reduce((acc, l) => acc + (l.processing?.greenWeight || 0), 0);

  // Agrupamento por produto
  const groupedProducts = stockLoads.reduce((acc, load) => {
    const productName = load.collection.type;
    if (!acc[productName]) {
      acc[productName] = {
        name: productName,
        stockWeight: 0,
        greenWeight: 0,
        lastUpdated: load.updatedAt,
      };
    }
    acc[productName].stockWeight += load.processing!.stockWeight || 0;
    acc[productName].greenWeight += load.processing!.greenWeight || 0;
    if (new Date(load.updatedAt) > new Date(acc[productName].lastUpdated)) acc[productName].lastUpdated = load.updatedAt;
    return acc;
  }, {} as Record<string, { name: string; stockWeight: number; greenWeight: number; lastUpdated: string }>);

  const groupedStock = Object.values(groupedProducts);

  const handleRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseModal) return;

    let toProd = Number(releaseForm.toProduction) || 0;
    let toBulk = Number(releaseForm.toBulk) || 0;
    const totalReq = toProd + toBulk;

    if (totalReq <= 0 || totalReq > releaseModal.available + 0.01) {
      toast.error('O total a liberar não pode exceder o peso disponível no estoque.');
      return;
    }

    const { productName } = releaseModal;
    
    // Pegar todas as cargas do produto em estoque
    const productLoads = stockLoads.filter(l => l.collection.type === productName);
    
    // Ordenar pelo mais antigo primeiro (FIFO) - data da coleta ou updatedAt
    productLoads.sort((a, b) => new Date(a.collection.date).getTime() - new Date(b.collection.date).getTime());

    const loadingToast = toast.loading(`Liberando ${productName}...`);

    for (const load of productLoads) {
      if (toProd <= 0 && toBulk <= 0) break; // Finalizou

      const availableInLoad = load.processing!.stockWeight;
      if (availableInLoad <= 0) continue;

      let deductProd = 0;
      let deductBulk = 0;

      if (toProd > 0) {
        deductProd = Math.min(availableInLoad, toProd);
        toProd -= deductProd;
      }
      
      const remainingInLoad = availableInLoad - deductProd;
      if (toBulk > 0 && remainingInLoad > 0) {
        deductBulk = Math.min(remainingInLoad, toBulk);
        toBulk -= deductBulk;
      }

      const historyItem = {
        date: new Date().toISOString(),
        authorId: currentUser!.id,
        authorName: currentUser!.name,
        action: 'liberou estoque via App Colaborador',
        details: `Reduziu <b>${(deductProd + deductBulk).toFixed(2)}kg</b> do estoque (Misto/FIFO).`
      };

      await updateLoad(load.id, {
        processing: {
          ...load.processing!,
          stockWeight: Math.max(0, load.processing!.stockWeight - (deductProd + deductBulk)),
          productionWeight: load.processing!.productionWeight + deductProd,
          bulkSaleWeight: load.processing!.bulkSaleWeight + deductBulk,
        },
        editHistory: [...(load.editHistory || []), historyItem]
      });
    }

    toast.success(`Liberados ${totalReq.toFixed(2)} kg de ${productName} com sucesso!`, { id: loadingToast });
    setReleaseModal(null);
    setReleaseForm({ toProduction: '', toBulk: '' });
  };

  if (!hasPermission) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-slate-100">
          <LockIcon size={40} className="text-slate-300" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Acesso Restrito</h2>
        <p className="text-slate-500 font-medium max-w-xs">Seu perfil não possui acesso autorizado ao controle e liberação de estoque.</p>
      </div>
    );
  }

  return (
    <div className="p-4 relative">
      <div className="mb-8">
        <h2 className="text-[28px] font-black text-brand tracking-tight">Estoque</h2>
        <p className="opacity-60 font-medium tracking-tight">Gestão de Armazém e Liberação</p>
      </div>

      {/* Resumo Mobile */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 shrink-0">
           <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
             <Warehouse size={20} />
           </div>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Disponível</p>
           <h3 className="text-xl font-black text-slate-800">{totalStockWeight.toFixed(0)} <span className="text-xs font-bold text-slate-400">kg</span></h3>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 shrink-0">
           <div className="w-10 h-10 rounded-xl bg-lime-50 text-lime-600 flex items-center justify-center mb-3">
             <Leaf size={20} />
           </div>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Irmaturo (Verde)</p>
           <h3 className="text-xl font-black text-slate-800">{totalGreenWeight.toFixed(0)} <span className="text-xs font-bold text-slate-400">kg</span></h3>
        </div>
      </div>

      {groupedStock.length === 0 ? (
        <EmptyState icon={Warehouse} title="Estoque Vazio" description="Nenhum produto armazenado no momento." /> 
      ) : (
        <div className="space-y-4 pb-20">
          {groupedStock.map(item => {
            const product = products.find(p => p.name.toLowerCase() === item.name.toLowerCase());
            
            return (
              <div key={item.name} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 overflow-hidden">
                     {product?.imageUrl ? (
                       <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                     ) : (
                       <Package size={20} className="text-slate-300" />
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Produto Armazenado</p>
                    <p className="text-lg font-black text-slate-800 truncate leading-none">{item.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col items-center">
                    <p className="text-[9px] font-bold text-amber-600 uppercase mb-0.5">Estoque Líquido</p>
                    <p className="text-base font-black text-slate-800">{item.stockWeight.toFixed(2)} <span className="text-[10px] text-slate-400">kg</span></p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col items-center">
                    <p className="text-[9px] font-bold text-lime-600 uppercase mb-0.5">Inclui Verde</p>
                    <p className="text-base font-black text-slate-800">
                      {item.greenWeight > 0 ? item.greenWeight.toFixed(2) : '0'} <span className="text-[10px] text-slate-400">kg</span>
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setReleaseModal({ productName: item.name, available: item.stockWeight })}
                  className="w-full bg-amber-50 text-amber-600 py-3 rounded-xl text-sm font-black hover:bg-amber-100 transition border border-amber-100 flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft size={16} /> Liberar Produto
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Liberação */}
      {releaseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-slate-900 mb-1">Liberar {releaseModal.productName}</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Peso Liberável: <strong className="text-brand">{releaseModal.available.toFixed(2)} kg</strong></p>

            <form onSubmit={handleRelease} className="space-y-4">
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest">
                  <Cog size={16} /> Vai para Produção
                </div>
                <FloatingLabelInput label="Qtd Produção (kg)" type="number" step="0.01" value={releaseForm.toProduction} onChange={e => setReleaseForm({...releaseForm, toProduction: e.target.value})} />
              </div>

              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest">
                  <ShoppingCart size={16} /> Vai para Granel
                </div>
                <FloatingLabelInput label="Qtd Granel (kg)" type="number" step="0.01" value={releaseForm.toBulk} onChange={e => setReleaseForm({...releaseForm, toBulk: e.target.value})} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setReleaseModal(null)} className="flex-1 px-4 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black hover:bg-slate-100 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={(Number(releaseForm.toProduction) || 0) + (Number(releaseForm.toBulk) || 0) <= 0} className="flex-1 px-4 py-4 btn-brand disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black flex items-center justify-center shadow-lg active:scale-95 transition-all">
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserEstoque;
