import React from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Truck, DollarSign, CheckCircle2, Scale, PackageOpen, Calendar } from 'lucide-react';

const ProducerDashboard = () => {
  const { loads, products, currentUser } = useAgro();

  // Filtra as cargas deste produtor
  const myLoads = loads.filter(l => l.producerId === currentUser?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Métricas
  const loadsInProgress = myLoads.filter(l => ['coletado', 'beneficiado'].includes(l.status)).length;
  const loadsToReceive = myLoads.filter(l => l.status === 'pagamento_programado').length;
  const loadsFinished = myLoads.filter(l => l.status === 'pago').length;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'coletado': return <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">No Barracão</span>;
      case 'beneficiado': return <span className="bg-violet-50 text-violet-600 border border-violet-100 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">Aguard. Acerto</span>;
      case 'pagamento_programado': return <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">A Receber</span>;
      case 'pago': return <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">Concluído</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Em Análise / Processo</p>
            <p className="text-2xl font-black text-slate-800 leading-none mt-1">{loadsInProgress} <span className="text-sm font-bold text-slate-400">cargas</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">A Receber</p>
            <p className="text-2xl font-black text-slate-800 leading-none mt-1">{loadsToReceive} <span className="text-sm font-bold text-slate-400">cargas</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Finalizadas</p>
            <p className="text-2xl font-black text-slate-800 leading-none mt-1">{loadsFinished} <span className="text-sm font-bold text-slate-400">cargas</span></p>
          </div>
        </div>
      </div>

      {/* Lista de Cargas */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Minhas Cargas</h3>
        
        {myLoads.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm">
            <PackageOpen size={48} className="mx-auto text-slate-300 mb-4" strokeWidth={1.5} />
            <h4 className="text-lg font-bold text-slate-700">Nenhuma carga vinculada</h4>
            <p className="text-slate-500">Assim que a empresa coletar seus produtos, eles aparecerão aqui.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {myLoads.map(load => {
              const product = products.find(p => p.name.toLowerCase() === load.collection.type.toLowerCase());
              
              return (
                <div key={load.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6">
                  
                  {/* Info Primária */}
                  <div className="flex items-start gap-4 sm:w-1/3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {product?.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <PackageOpen size={24} className="text-slate-300" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: #{load.id.slice(-6)}</span>
                      <h4 className="font-black text-slate-800 text-lg leading-tight mt-0.5">{load.collection.type}</h4>
                      <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1.5">
                        <Calendar size={12}/> {new Date(load.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Detalhes de Peso e Financeiro */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
                    
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Scale size={10}/> Peso Roça</p>
                      <p className="text-lg font-black text-slate-700">{load.collection.grossWeight} <span className="text-xs font-bold text-slate-400">kg</span></p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><CheckCircle2 size={10}/> Peso Líquido</p>
                      <p className="text-lg font-black text-slate-800">
                        {load.processing ? load.processing.netWeight : '---'} <span className="text-xs font-bold text-slate-400">kg</span>
                      </p>
                    </div>

                    <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor do Acerto</p>
                      {load.financial ? (
                        <div>
                          <p className="text-lg font-black text-emerald-600">
                            {load.financial.finalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                          <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                            Data: {new Date(load.financial.scheduledPaymentDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl inline-block">
                          Aguardando precificação
                        </p>
                      )}
                    </div>

                  </div>

                  {/* Status */}
                  <div className="sm:border-l border-slate-100 sm:pl-6 flex items-center sm:items-start justify-end sm:justify-center border-t sm:border-t-0 pt-4 sm:pt-0">
                    {getStatusBadge(load.status)}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ProducerDashboard;