import React, { useState } from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Receipt, Package, DollarSign, X, Scale, CheckCircle2, Search, Calendar, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '../../components/ImageUpload';

const AdminFinanceiro = () => {
  const { loads, producers, products, updateLoad, currentUser } = useAgro();
  
  const companyLoads = loads.filter(l => l.companyId === currentUser?.companyId);
  const pendingLoads = companyLoads.filter(l => l.status === 'beneficiado' && ((l.processing?.productionWeight || 0) > 0 || (l.processing?.bulkSaleWeight || 0) > 0));
  const scheduledLoads = companyLoads.filter(l => l.status === 'pagamento_programado');
  
  const [selectedLoadId, setSelectedLoadId] = useState('');
  const [form, setForm] = useState({ 
    pricePerKg: '', 
    discounts: '', 
    scheduledPaymentDate: '' 
  });
  const [payModal, setPayModal] = useState<{ id: string, amount: number, producer: string } | null>(null);
  const [comprovante, setComprovante] = useState('');
  const [searchProducer, setSearchProducer] = useState('');

  const selectedLoad = pendingLoads.find(l => l.id === selectedLoadId);
  const selectedProduct = selectedLoad ? products.find(p => p.name.toLowerCase() === selectedLoad.collection.type.toLowerCase()) : null;

  const prodWeight = selectedLoad?.processing?.productionWeight || 0;
  const bulkWeight = selectedLoad?.processing?.bulkSaleWeight || 0;
  const price = Number(form.pricePerKg) || 0;
  
  const discounts = Number(form.discounts) || 0;
  const grossValue = (prodWeight + bulkWeight) * price;
  const finalValue = Math.max(0, grossValue - discounts);

  const totalPending = pendingLoads.reduce((acc, l) => acc + (l.processing?.netWeight || 0), 0);
  const totalScheduled = scheduledLoads.reduce((acc, l) => acc + (l.financial?.finalValue || 0), 0);

  const filteredPending = pendingLoads.filter(load => {
    if (!searchProducer) return true;
    const prod = producers.find(p => p.id === load.producerId);
    return prod?.name.toLowerCase().includes(searchProducer.toLowerCase());
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoad) return;

    let saleType: 'producao' | 'granel' | 'misto' = 'producao';
    if (prodWeight > 0 && bulkWeight > 0) saleType = 'misto';
    else if (bulkWeight > 0) saleType = 'granel';

    updateLoad(selectedLoad.id, {
      status: 'pagamento_programado',
      financial: { 
        id: `fin_${Date.now()}`, 
        netWeight: prodWeight + bulkWeight,
        productionWeight: prodWeight,
        bulkWeight: bulkWeight,
        pricePerKg: price,
        discounts, 
        grossValue, 
        finalValue, 
        scheduledPaymentDate: form.scheduledPaymentDate,
        saleType
      }
    });
    
    toast.success('Acerto financeiro realizado com sucesso!', { description: `Valor: R$ ${finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` });
    setSelectedLoadId('');
    setForm({ pricePerKg: '', discounts: '', scheduledPaymentDate: '' });
  };

  const handleMarkPaid = () => {
    if (!payModal) return;
    updateLoad(payModal.id, { 
      status: 'pago',
      payment: {
        id: `pay_${Date.now()}`,
        paymentDate: new Date().toISOString(),
        comprovanteUrl: comprovante
      }
    });
    toast.success('Pagamento confirmado!');
    setPayModal(null);
    setComprovante('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-[28px] font-black text-slate-900 flex items-center gap-3 tracking-tight">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
            <DollarSign size={24} className="text-brand" />
          </div>
          Financeiro
        </h2>
        <p className="text-slate-500 font-medium mt-2">
          Acertos de valores, precificação e controle de pagamentos.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Aguardando Acerto</p>
            <h3 className="text-3xl font-bold text-slate-800">{pendingLoads.length}</h3>
            <p className="text-xs text-slate-400 font-medium mt-2">{totalPending.toFixed(0)} kg pendentes</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Scale size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Pagamentos Programados</p>
            <h3 className="text-3xl font-bold text-slate-800">{scheduledLoads.length}</h3>
            <p className="text-xs text-amber-600 font-medium mt-2">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalScheduled)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Finalizados (Este Mês)</p>
            <h3 className="text-3xl font-bold text-slate-800">
              {companyLoads.filter(l => l.status === 'pago').length}
            </h3>
            <p className="text-xs text-emerald-600 font-medium mt-2">Concluídos</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Cargas Pendentes de Acerto */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Receipt size={20} className="text-amber-600" /> Cargas Aguardando Acerto
            </h3>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar produtor..." 
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand-soft outline-none transition-all w-56"
                value={searchProducer}
                onChange={(e) => setSearchProducer(e.target.value)}
              />
            </div>
          </div>

          {filteredPending.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Receipt size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold text-slate-600">Nenhuma carga pendente</p>
              <p className="text-sm">Todas as cargas beneficiadas já foram precificadas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-sm font-semibold text-slate-500">ID</th>
                    <th className="pb-3 text-sm font-semibold text-slate-500">Produtor</th>
                    <th className="pb-3 text-sm font-semibold text-slate-500">Produto</th>
                    <th className="pb-3 text-sm font-semibold text-slate-500">Destinação</th>
                    <th className="pb-3 text-sm font-semibold text-slate-500">Peso Financeiro</th>
                    <th className="pb-3 text-sm font-semibold text-slate-500 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPending.map(load => {
                    const prod = producers.find(p => p.id === load.producerId);
                    const product = products.find(p => p.name.toLowerCase() === load.collection.type.toLowerCase());
                    
                    return (
                      <tr key={load.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 text-sm font-bold text-slate-900">#{load.id.slice(-6)}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs border border-emerald-100">
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
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {(load.processing?.productionWeight || 0) > 0 && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">Produção: {load.processing?.productionWeight} kg</span>
                            )}
                            {(load.processing?.bulkSaleWeight || 0) > 0 && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">Granel: {load.processing?.bulkSaleWeight} kg</span>
                            )}
                            {(load.processing?.stockWeight || 0) > 0 && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">Estoque: {load.processing?.stockWeight} kg</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-sm font-bold text-slate-800">{((load.processing?.productionWeight || 0) + (load.processing?.bulkSaleWeight || 0)).toFixed(0)} kg</td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => setSelectedLoadId(load.id)}
                            className="btn-brand px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                          >
                            Precificar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagamentos Programados */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" /> Pagamentos Agendados
          </h3>
          <div className="space-y-3">
            {scheduledLoads.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhum pagamento pendente.</p>
            ) : (
              scheduledLoads.map(load => {
                const prod = producers.find(p => p.id === load.producerId);
                return (
                  <div key={load.id} className="p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{prod?.name}</p>
                        <p className="text-xs text-slate-500">{load.collection.type} • {load.processing?.netWeight} kg</p>
                      </div>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                        {load.financial?.scheduledPaymentDate ? new Date(load.financial.scheduledPaymentDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-black text-slate-900">
                        {load.financial?.finalValue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <button 
                        onClick={() => setPayModal({ id: load.id, amount: load.financial?.finalValue || 0, producer: prod?.name || '' })}
                        className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-100 transition opacity-0 group-hover:opacity-100"
                      >
                        Pagar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE PRECIFICAÇÃO */}
      {selectedLoadId && selectedLoad && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Acerto Financeiro</h3>
                <p className="text-sm text-slate-500 mt-1">Defina o preço e agende o pagamento</p>
              </div>
              <button onClick={() => setSelectedLoadId('')} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Info da Carga */}
            <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Carga Beneficiada</p>
              <h4 className="font-black text-xl text-slate-800 mb-4">{producers.find(p => p.id === selectedLoad.producerId)?.name}</h4>
              
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2.5">
                  {selectedProduct?.imageUrl ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                      <Package size={14} className="text-slate-400" />
                    </div>
                  )}
                  <span className="text-sm font-bold text-slate-600">{selectedLoad.collection.type}</span>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 font-black text-slate-800">
                  {prodWeight + bulkWeight} kg
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-around items-center">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produção</p>
                  <p className="text-sm font-black text-emerald-600">{prodWeight} kg</p>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">A Granel</p>
                  <p className="text-sm font-black text-blue-600">{bulkWeight} kg</p>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Financeiro</p>
                  <p className="text-sm font-black text-slate-800">{prodWeight + bulkWeight} kg</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Preço do Dia (R$/kg) *</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand-soft rounded-xl px-4 py-3 outline-none transition-all text-slate-800 font-medium"
                    placeholder="0,00"
                    value={form.pricePerKg} onChange={(e) => setForm({...form, pricePerKg: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Descontos (R$)</label>
                  <input 
                    type="number" step="0.01"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand-soft rounded-xl px-4 py-3 outline-none transition-all text-slate-800 font-medium"
                    placeholder="Ex: 0,00"
                    value={form.discounts} onChange={(e) => setForm({...form, discounts: e.target.value})}
                  />
                </div>
              </div>

              {/* Card de Resultado */}
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden text-brand-light">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 rounded-full blur-3xl text-brand"></div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total a Pagar</p>
                <div className="flex items-start gap-1">
                  <span className="text-xl font-bold text-brand mt-1">R$</span>
                  <span className="text-5xl font-black tracking-tighter text-white">
                    {finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Data do Pagamento *</label>
                <input 
                  type="date" required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand-soft rounded-xl px-4 py-3 outline-none transition-all text-slate-800 font-medium"
                  value={form.scheduledPaymentDate} onChange={(e) => setForm({...form, scheduledPaymentDate: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setSelectedLoadId('')} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={!form.pricePerKg || !form.scheduledPaymentDate} className="flex-1 px-4 py-3 btn-brand disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold transition shadow-lg">
                  Confirmar Acerto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de Confirmação de Pagamento */}
      {payModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Confirmar Pagamento</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              Você está quitando o valor de <strong className="text-emerald-600 font-black">{payModal.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> para <strong>{payModal.producer}</strong>.
            </p>

            <div className="space-y-4 mb-8">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Camera size={16} className="text-emerald-600" /> Comprovante de Pagamento
              </label>
              <ImageUpload 
                value={comprovante}
                onChange={setComprovante}
              />
              <p className="text-[10px] text-slate-400 font-medium italic text-center">Anexe o PDF ou Foto do comprovante bancário.</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setPayModal(null); setComprovante(''); }} 
                className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleMarkPaid}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFinanceiro;
