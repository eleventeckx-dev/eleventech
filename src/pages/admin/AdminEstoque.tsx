import React, { useState } from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Warehouse, Package, Search, Leaf, ArrowRightLeft, Cog, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const AdminEstoque = () => {
  const { loads, producers, products, updateLoad, currentUser } = useAgro();
  const [searchProducer, setSearchProducer] = useState('');
  const [releaseModal, setReleaseModal] = useState<{ loadId: string; available: number } | null>(null);
  const [releaseForm, setReleaseForm] = useState({ toProduction: '', toBulk: '' });

  const companyLoads = loads.filter(l => l.companyId === currentUser?.companyId);

  // Cargas que possuem peso em estoque
  const stockLoads = companyLoads.filter(l => 
    l.processing && l.processing.stockWeight > 0
  );

  const totalStockWeight = stockLoads.reduce((acc, l) => acc + (l.processing?.stockWeight || 0), 0);
  const totalGreenWeight = stockLoads.reduce((acc, l) => acc + (l.processing?.greenWeight || 0), 0);

  const filteredLoads = stockLoads.filter(load => {
    if (!searchProducer) return true;
    const prod = producers.find(p => p.id === load.producerId);
    return prod?.name.toLowerCase().includes(searchProducer.toLowerCase());
  });

  const handleRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseModal) return;

    const toProd = Number(releaseForm.toProduction) || 0;
    const toBulk = Number(releaseForm.toBulk) || 0;
    const total = toProd + toBulk;

    if (total <= 0 || total > releaseModal.available + 0.01) {
      toast.error('O total a liberar não pode exceder o peso disponível no estoque.');
      return;
    }

    const load = loads.find(l => l.id === releaseModal.loadId);
    if (!load?.processing) return;

    updateLoad(releaseModal.loadId, {
      processing: {
        ...load.processing,
        stockWeight: Math.max(0, load.processing.stockWeight - total),
        productionWeight: load.processing.productionWeight + toProd,
        bulkSaleWeight: load.processing.bulkSaleWeight + toBulk,
      }
    });

    toast.success(`Liberados ${total.toFixed(2)} kg do estoque!`);
    setReleaseModal(null);
    setReleaseForm({ toProduction: '', toBulk: '' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-[28px] font-black text-slate-900 flex items-center gap-3 tracking-tight">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
            <Warehouse size={24} className="text-amber-600" />
          </div>
          Estoque
        </h2>
        <p className="text-slate-500 font-medium mt-2">
          Produtos armazenados para maturação e controle de saída.
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total em Estoque</p>
            <h3 className="text-3xl font-bold text-slate-800">{totalStockWeight.toFixed(0)} <span className="text-base font-medium text-slate-400">kg</span></h3>
            <p className="text-xs text-slate-400 font-medium mt-2">{stockLoads.length} lotes armazenados</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Warehouse size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Produtos Verdes</p>
            <h3 className="text-3xl font-bold text-slate-800">{totalGreenWeight.toFixed(0)} <span className="text-base font-medium text-slate-400">kg</span></h3>
            <p className="text-xs text-lime-600 font-medium mt-2">Em maturação</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-lime-50 text-lime-600 flex items-center justify-center">
            <Leaf size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Produtos Disponíveis</p>
            <h3 className="text-3xl font-bold text-slate-800">{products.filter(p => p.companyId === currentUser?.companyId).length}</h3>
            <p className="text-xs text-slate-400 font-medium mt-2">Cadastrados</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package size={24} />
          </div>
        </div>
      </div>

      {/* Tabela de Estoque */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Warehouse size={20} className="text-amber-600" /> Lotes em Estoque
          </h3>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" placeholder="Buscar produtor..." 
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all w-full md:w-56"
              value={searchProducer} onChange={(e) => setSearchProducer(e.target.value)}
            />
          </div>
        </div>

        {filteredLoads.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Warehouse size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold text-slate-600">Estoque vazio</p>
            <p className="text-sm">Nenhum produto armazenado no momento.</p>
          </div>
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-sm font-semibold text-slate-500">ID</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500">Produtor</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500">Produto</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500">Estoque</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500">Verde</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500">Data</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLoads.map(load => {
                  const prod = producers.find(p => p.id === load.producerId);
                  const product = products.find(p => p.name.toLowerCase() === load.collection.type.toLowerCase());

                  return (
                    <tr key={load.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-sm font-bold text-slate-900">#{load.id.slice(-6)}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-xs border border-amber-100">
                            {prod?.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{prod?.name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-slate-50 overflow-hidden border border-slate-100 shrink-0">
                            {product?.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Package size={12} className="text-slate-300" /></div>
                            )}
                          </div>
                          <span className="text-sm text-slate-600">{load.collection.type}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm font-bold text-amber-700">
                        {load.processing?.stockWeight} kg
                      </td>
                      <td className="py-4">
                        {(load.processing?.greenWeight || 0) > 0 ? (
                          <span className="text-xs font-bold text-lime-600 bg-lime-50 px-2 py-1 rounded-lg border border-lime-100">
                            {load.processing?.greenWeight} kg
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 text-sm text-slate-500">
                        {new Date(load.updatedAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => setReleaseModal({ loadId: load.id, available: load.processing?.stockWeight || 0 })}
                          className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-100 transition border border-amber-200"
                        >
                          <ArrowRightLeft size={14} className="inline mr-1.5" />
                          Liberar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden space-y-3">
            {filteredLoads.map(load => {
              const prod = producers.find(p => p.id === load.producerId);
              const product = products.find(p => p.name.toLowerCase() === load.collection.type.toLowerCase());
              return (
                <div key={load.id} className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-sm border border-amber-100 shrink-0">
                      {prod?.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{prod?.name}</p>
                      <p className="text-xs text-slate-500">{load.collection.type} • #{load.id.slice(-6)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white rounded-xl p-2.5 border border-slate-100 text-center">
                      <p className="text-[9px] font-bold text-amber-600 uppercase">Estoque</p>
                      <p className="text-sm font-black text-slate-800">{load.processing?.stockWeight} kg</p>
                    </div>
                    <div className="bg-white rounded-xl p-2.5 border border-slate-100 text-center">
                      <p className="text-[9px] font-bold text-lime-600 uppercase">Verde</p>
                      <p className="text-sm font-black text-slate-800">{(load.processing?.greenWeight || 0) > 0 ? `${load.processing?.greenWeight} kg` : '—'}</p>
                    </div>
                    <div className="bg-white rounded-xl p-2.5 border border-slate-100 text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Data</p>
                      <p className="text-xs font-bold text-slate-600">{new Date(load.updatedAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setReleaseModal({ loadId: load.id, available: load.processing?.stockWeight || 0 })}
                    className="w-full bg-amber-50 text-amber-700 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-100 transition border border-amber-200 flex items-center justify-center gap-1.5"
                  >
                    <ArrowRightLeft size={14} /> Liberar do Estoque
                  </button>
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>

      {/* Modal de Liberação */}
      {releaseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Liberar do Estoque</h3>
            <p className="text-sm text-slate-500 mb-6">Disponível: <strong className="text-amber-700">{releaseModal.available.toFixed(2)} kg</strong></p>

            <form onSubmit={handleRelease} className="space-y-5">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <Cog size={16} /> Para Produção
                </div>
                <input 
                  type="number" step="0.01" placeholder="0.00"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl px-4 py-3 outline-none transition-all text-slate-800 font-medium"
                  value={releaseForm.toProduction} onChange={e => setReleaseForm({...releaseForm, toProduction: e.target.value})}
                />
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
                  <ShoppingCart size={16} /> Para Venda a Granel
                </div>
                <input 
                  type="number" step="0.01" placeholder="0.00"
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 outline-none transition-all text-slate-800 font-medium"
                  value={releaseForm.toBulk} onChange={e => setReleaseForm({...releaseForm, toBulk: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setReleaseModal(null)} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={(Number(releaseForm.toProduction) || 0) + (Number(releaseForm.toBulk) || 0) <= 0} className="flex-1 px-4 py-3 bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold hover:bg-amber-700 transition shadow-lg shadow-amber-500/30">
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

export default AdminEstoque;
