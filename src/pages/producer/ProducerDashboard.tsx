import React from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Truck, DollarSign, CheckCircle2, Scale, PackageOpen, Calendar, ArrowRight, Receipt, FileText } from 'lucide-react';
import { PremiumCard, EmptyState } from '../../components/shared/UserUIComponents';

const ProducerDashboard = () => {
  const { loads, products, currentUser } = useAgro();

  // O produtor enxerga cargas a partir do término do beneficiamento (beneficiado, pagamento_programado, pago)
  const myLoads = loads
    .filter(l => l.producerId === currentUser?.id && ['beneficiado', 'pagamento_programado', 'pago'].includes(l.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Métricas
  const loadsToReceive = myLoads.filter(l => ['beneficiado', 'pagamento_programado'].includes(l.status));
  const loadsFinished = myLoads.filter(l => l.status === 'pago');
  
  const amountToReceive = myLoads.filter(l => l.status === 'pagamento_programado').reduce((acc, l) => acc + (l.financial?.finalValue || 0), 0);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'beneficiado': return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-sm">Na Fila Financeira</span>;
      case 'pagamento_programado': return <span className="bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-sm">A Receber</span>;
      case 'pago': return <span className="bg-brand-soft text-brand border border-brand-soft px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-sm">Pago</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto p-2 sm:p-4">
      
      <div className="mb-8">
        <h2 className="text-[28px] font-black text-brand tracking-tight">Meu Financeiro</h2>
        <p className="opacity-60 font-medium tracking-tight">Relatórios de acertos e previsões de pagamento</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PremiumCard className="relative overflow-hidden group border border-amber-200/50 hover:border-amber-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">A Receber</p>
              <p className="text-2xl font-black text-amber-600 leading-none mt-1.5">
                {amountToReceive.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
              <Receipt size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cargas Pendentes</p>
              <p className="text-2xl font-black text-slate-800 leading-none mt-1.5">
                {loadsToReceive.length} <span className="text-sm font-bold text-slate-400">pendentes</span>
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="relative overflow-hidden group border border-brand-soft/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-soft text-brand flex items-center justify-center shrink-0 border border-brand-soft">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Finalizadas</p>
              <p className="text-2xl font-black text-slate-800 leading-none mt-1.5">
                {loadsFinished.length} <span className="text-sm font-bold text-slate-400">pagas</span>
              </p>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Lista de Cargas Fechadas */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-slate-400" />
          Relatório Detalhado
        </h3>
        
        {myLoads.length === 0 ? (
           <EmptyState 
             icon={PackageOpen} 
             title="Nenhum acerto disponível" 
             description="Assim que a empresa processar e fechar o financeiro de sua carga, o recibo detalhado aparecerá aqui." 
           />
        ) : (
          <div className="grid gap-6">
            {myLoads.map(load => {
              const product = products.find(p => p.name.toLowerCase() === load.collection.type.toLowerCase());
              const fin = load.financial;
              const proc = load.processing;

              return (
                <PremiumCard key={load.id} className="relative overflow-hidden group border border-slate-200">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-white rounded-bl-full -z-10"></div>
                  
                  {/* Cabeçalho do Faturamento */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-brand-soft border border-brand-soft/50 flex items-center justify-center shrink-0 overflow-hidden text-brand">
                        {product?.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <PackageOpen size={24} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Carga ID: #{load.id.slice(-6)}</span>
                        </div>
                        <h4 className="font-black text-brand text-xl leading-tight mt-0.5">{load.collection.type}</h4>
                        <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1.5">
                          <Calendar size={12}/> Entrada: {new Date(load.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(load.status)}
                      <p className="text-xs font-bold text-slate-500">
                        {fin ? `Previsão: ${new Date(fin.scheduledPaymentDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}` : 'Aguardando financeiro'}
                      </p>
                    </div>
                  </div>

                  {/* Corpo do Recibo (Tabela Info) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Pesagem & Quebra</h5>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Peso Recebido (Pátio):</span>
                        <span className="font-bold text-slate-700">{load.collection.grossWeight} kg</span>
                      </div>
                      {proc && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-medium">Descartes / Danos / Diferença:</span>
                          <span className="font-bold text-rose-500">-{Math.abs(proc.damage + proc.discard + proc.weightDifference).toFixed(2)} kg</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-brand font-black">Peso Aproveitado:</span>
                        <span className="font-black text-brand">{fin?.netWeight || (proc?.netWeight)} kg</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Valores</h5>
                      
                      {fin ? (
                        <>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Preço Base (por kg):</span>
                            <span className="font-bold text-slate-700">{fin.pricePerKg.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Subtotal Líquido:</span>
                            <span className="font-bold text-slate-700">{fin.grossValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          </div>
                          {(fin.discounts > 0) && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500 font-medium">Descontos (Frete/Outros):</span>
                              <span className="font-bold text-amber-500">-{fin.discounts.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 h-[calc(100%-1.75rem)] bg-slate-50 rounded-xl border border-slate-100 border-dashed text-center">
                           <DollarSign size={20} className="text-slate-300 mb-1" />
                           <p className="text-xs font-bold text-slate-500">Financeiro pendente</p>
                           <p className="text-[10px] text-slate-400 leading-tight mt-0.5 px-2">O valor final será calculado e liberado pelo financeiro em breve.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Totalizador */}
                  <div className="bg-brand-soft/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center border border-brand-soft/50 border-dashed">
                     <span className="text-sm font-bold text-brand mb-1 sm:mb-0">Valor Final de Acerto</span>
                     {fin ? (
                       <span className="text-2xl font-black text-emerald-600">
                         {fin.finalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                       </span>
                     ) : (
                       <span className="text-base font-black text-slate-400/80 italic tracking-tight">Em cálculo...</span>
                     )}
                  </div>

                </PremiumCard>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ProducerDashboard;