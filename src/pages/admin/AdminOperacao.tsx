import React from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Truck, Factory, DollarSign, CheckCircle2, Eye, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const AdminOperacao = () => {
  const { loads, producers } = useAgro();

  // Função simulada para os botões de ação e detalhe
  const handleAction = (action: string, loadId: string) => {
    toast.success(`${action} iniciada para a carga #${loadId.slice(-4)} (Simulação)`);
  };

  const handleDetails = (loadId: string) => {
    toast.info(`Abrindo detalhes da carga #${loadId.slice(-4)}...`);
  };

  // Definição das colunas baseadas no LoadStatus
  const columns = [
    {
      id: 'coletado',
      title: 'Aguardando Beneficiamento',
      icon: Truck,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      badgeBg: 'bg-blue-600',
      actionText: 'Beneficiar',
      actionIcon: Factory,
      loads: loads.filter(l => l.status === 'coletado')
    },
    {
      id: 'beneficiado',
      title: 'Aguardando Financeiro',
      icon: Factory,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
      badgeBg: 'bg-indigo-600',
      actionText: 'Gerar Financeiro',
      actionIcon: DollarSign,
      loads: loads.filter(l => l.status === 'beneficiado')
    },
    {
      id: 'pagamento_programado',
      title: 'Pagamentos Programados',
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      badgeBg: 'bg-amber-500',
      actionText: 'Confirmar Pagamento',
      actionIcon: CheckCircle2,
      loads: loads.filter(l => l.status === 'pagamento_programado')
    },
    {
      id: 'pago',
      title: 'Finalizadas / Pagas',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      badgeBg: 'bg-emerald-600',
      actionText: 'Ver Recibo',
      actionIcon: Eye,
      loads: loads.filter(l => l.status === 'pago')
    }
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Central de Operações</h2>
        <p className="text-sm text-slate-500">Acompanhe e atue no fluxo completo de cargas da empresa.</p>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-6 pb-4 custom-scrollbar">
        {columns.map((col) => {
          const Icon = col.icon;
          return (
            <div key={col.id} className="w-[340px] flex-shrink-0 flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200 overflow-hidden">
              
              {/* Column Header */}
              <div className="p-4 border-b border-slate-200 bg-white/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${col.bg} ${col.color}`}>
                    <Icon size={16} strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-slate-700 text-sm">{col.title}</h3>
                </div>
                <span className={`text-xs font-bold text-white px-2 py-1 rounded-full ${col.badgeBg}`}>
                  {col.loads.length}
                </span>
              </div>

              {/* Column Body (Scrollable Cards) */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {col.loads.map(load => {
                  const producer = producers.find(p => p.id === load.producerId);
                  const ActionIcon = col.actionIcon;
                  
                  return (
                    <div key={load.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                      
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs font-bold text-slate-400 mb-0.5">#{load.id.slice(-6).toUpperCase()}</p>
                          <p className="font-bold text-slate-800 leading-tight">{producer?.name}</p>
                        </div>
                        <button 
                          onClick={() => handleDetails(load.id)}
                          className="text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                          title="Abrir Detalhes"
                        >
                          <Eye size={18} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="font-medium">{load.collection.type}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="font-bold text-slate-700">
                          {load.status === 'coletado' ? load.collection.grossWeight : load.processing?.netWeight} kg
                        </span>
                      </div>

                      <button 
                        onClick={() => handleAction(col.actionText, load.id)}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all border
                          ${load.status === 'pago' 
                            ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800' 
                            : 'bg-slate-800 text-white border-slate-800 hover:bg-slate-700 shadow-md shadow-slate-800/10'
                          }
                        `}
                      >
                        {col.actionText}
                        {load.status !== 'pago' && <ArrowRight size={16} />}
                      </button>

                    </div>
                  );
                })}

                {col.loads.length === 0 && (
                  <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <Icon size={24} className="opacity-50" />
                    <span className="text-xs font-medium">Nenhuma carga nesta etapa</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminOperacao;