import React, { useState } from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { 
  Truck, Factory, DollarSign, CheckCircle2, Search, 
  Calendar, User, PackageSearch, PackageOpen, 
  Clock, Scale, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const AdminOperacao = () => {
  const { loads, producers, users, products } = useAgro();

  // Estados dos Filtros
  const [searchId, setSearchId] = useState('');
  const [producerFilter, setProducerFilter] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  
  // Estado da Aba Ativa
  const [activeTab, setActiveTab] = useState<'coletado' | 'beneficiado' | 'pagamento_programado' | 'pago'>('coletado');

  // Filtro Base (Ignora Status, para os contadores funcionarem nas abas)
  const baseFilteredLoads = loads.filter(load => {
    if (searchId && !load.id.toLowerCase().includes(searchId.toLowerCase())) return false;
    if (producerFilter !== 'all' && load.producerId !== producerFilter) return false;
    
    if (dateStart) {
      const start = new Date(dateStart);
      start.setHours(0, 0, 0, 0);
      if (new Date(load.updatedAt) < start) return false;
    }
    if (dateEnd) {
      const end = new Date(dateEnd);
      end.setHours(23, 59, 59, 999);
      if (new Date(load.updatedAt) > end) return false;
    }
    
    return true;
  });

  // Cargas da aba atual
  const currentLoads = baseFilteredLoads.filter(l => l.status === activeTab);

  const handleDetails = (loadId: string) => {
    toast.info(`Painel de Detalhes da Carga #${loadId.slice(-6).toUpperCase()}`, {
      description: 'A visualização completa de histórico e fotos será aberta em breve.'
    });
  };

  // Definição das Etapas (Abas)
  const stages = [
    {
      id: 'coletado',
      title: 'Em Trânsito / Barracão',
      subtitle: 'Aguardando Beneficiamento',
      icon: Truck,
      color: 'text-blue-600',
      bg: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      border: 'border-blue-200',
      count: baseFilteredLoads.filter(l => l.status === 'coletado').length
    },
    {
      id: 'beneficiado',
      title: 'Beneficiado',
      subtitle: 'Aguardando Fechamento',
      icon: Factory,
      color: 'text-violet-600',
      bg: 'bg-violet-500',
      lightBg: 'bg-violet-50',
      border: 'border-violet-200',
      count: baseFilteredLoads.filter(l => l.status === 'beneficiado').length
    },
    {
      id: 'pagamento_programado',
      title: 'A Pagar',
      subtitle: 'Pagamento Programado',
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-500',
      lightBg: 'bg-amber-50',
      border: 'border-amber-200',
      count: baseFilteredLoads.filter(l => l.status === 'pagamento_programado').length
    },
    {
      id: 'pago',
      title: 'Finalizadas',
      subtitle: 'Acertos Concluídos',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500',
      lightBg: 'bg-emerald-50',
      border: 'border-emerald-200',
      count: baseFilteredLoads.filter(l => l.status === 'pago').length
    }
  ] as const;

  const activeStage = stages.find(s => s.id === activeTab)!;

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Cabeçalho */}
      <div>
        <h2 className="text-[28px] font-black text-slate-900 flex items-center gap-3 tracking-tight">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
            <PackageSearch size={24} className="text-emerald-600" />
          </div>
          Central de Operações
        </h2>
        <p className="text-slate-500 font-medium mt-2">
          Monitoramento em tempo real do fluxo de cargas, do campo ao financeiro.
        </p>
      </div>

      {/* Barra de Filtros Premium (Removido filtro de status pois as abas já fazem isso) */}
      <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Buscar ID</label>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Ex: load_123" 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full md:w-auto min-w-[220px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1"><User size={12}/> Produtor</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none"
            value={producerFilter}
            onChange={(e) => setProducerFilter(e.target.value)}
          >
            <option value="all">Todos os Produtores</option>
            {producers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="w-full lg:w-auto min-w-[300px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1"><Calendar size={12}/> Período de Movimentação</label>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-1">
            <input 
              type="date" 
              className="w-full bg-transparent px-3 py-2 text-sm font-medium text-slate-700 outline-none"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
            <span className="text-slate-300 font-bold">-</span>
            <input 
              type="date" 
              className="w-full bg-transparent px-3 py-2 text-sm font-medium text-slate-700 outline-none"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Sub-abas de Etapas (Premium Segmented Control) */}
      <div className="bg-slate-200/50 p-2 rounded-[2rem] flex overflow-x-auto custom-scrollbar gap-2 items-center">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const isActive = activeTab === stage.id;
          
          return (
            <button
              key={stage.id}
              onClick={() => setActiveTab(stage.id as any)}
              className={`flex-1 min-w-[240px] flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 relative overflow-hidden group ${
                isActive 
                  ? 'bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-200/50' 
                  : 'hover:bg-slate-100/80 border border-transparent'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                isActive ? stage.bg + ' text-white shadow-sm' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-200'
              }`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <div className="flex-1 text-left">
                <h3 className={`font-black text-base leading-tight transition-colors ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                  {stage.title}
                </h3>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 transition-colors ${isActive ? stage.color : 'text-slate-400'}`}>
                  {stage.subtitle}
                </p>
              </div>
              <span className={`text-lg font-black shrink-0 px-3 py-1 rounded-xl transition-all ${
                isActive ? stage.lightBg + ' ' + stage.color : 'text-slate-400 bg-slate-100'
              }`}>
                {stage.count}
              </span>
              
              {/* Barra indicadora inferior quando ativo */}
              {isActive && (
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 rounded-t-full ${stage.bg}`}></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Título da Seção Atual (Opcional, mas dá bom contexto) */}
      <div className="flex justify-between items-center py-2 px-2">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          {activeStage.title} <span className="text-slate-400 font-medium text-base">({currentLoads.length})</span>
        </h3>
      </div>

      {/* Grid de Cargas */}
      {currentLoads.length === 0 ? (
        <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <activeStage.icon size={32} className="opacity-40" />
          </div>
          <h4 className="text-lg font-bold text-slate-600 mb-1">Nenhuma carga encontrada</h4>
          <p className="text-sm">Não há itens nesta etapa correspondentes aos filtros aplicados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pb-8">
          {currentLoads.map((load, i) => {
            const producer = producers.find(p => p.id === load.producerId);
            const responsible = users.find(u => u.id === load.collection.responsibleId);
            const product = products.find(p => p.name.toLowerCase() === load.collection.type.toLowerCase());
            
            return (
              <div 
                key={load.id} 
                className="w-full bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 group relative animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
              >
                {/* Faixa Lateral de Status */}
                <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${activeStage.bg}`}></div>

                <div className="pl-3">
                  
                  {/* Ticket Header: Produto & Produtor */}
                  <div className="flex items-start gap-4 mb-5">
                    {/* Imagem do Produto */}
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                      {product?.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <PackageOpen size={24} className="text-slate-300" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                          #{load.id.slice(-6)}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${activeStage.lightBg} ${activeStage.color}`}>
                          {load.collection.category}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-800 text-[17px] leading-tight truncate" title={producer?.name}>
                        {producer?.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-500 truncate mt-0.5">{load.collection.type}</p>
                    </div>
                  </div>

                  {/* Divisor Dashed */}
                  <div className="w-full border-t-2 border-dashed border-slate-100 my-4 relative">
                    <div className="absolute -left-5 -top-2 w-4 h-4 rounded-full bg-slate-50"></div>
                    <div className="absolute -right-5 -top-2 w-4 h-4 rounded-full bg-slate-50"></div>
                  </div>

                  {/* Pesos & Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100/50 flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Scale size={12} className="text-slate-400" />
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Peso Roça</p>
                      </div>
                      <p className="text-sm font-black text-slate-700">{load.collection.grossWeight} <span className="text-[10px] font-semibold text-slate-400">kg</span></p>
                    </div>
                    
                    <div className={`rounded-2xl p-3 border flex flex-col justify-center ${['beneficiado', 'pagamento_programado', 'pago'].includes(load.status) ? activeStage.lightBg + ' ' + activeStage.border : 'bg-slate-50/80 border-slate-100/50'}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle2 size={12} className={['beneficiado', 'pagamento_programado', 'pago'].includes(load.status) ? activeStage.color : 'text-slate-400'} />
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${['beneficiado', 'pagamento_programado', 'pago'].includes(load.status) ? activeStage.color : 'text-slate-500'}`}>Peso Líquido</p>
                      </div>
                      <p className="text-sm font-black text-slate-800">
                        {load.processing ? load.processing.netWeight : '---'} <span className="text-[10px] font-semibold opacity-60">kg</span>
                      </p>
                    </div>
                  </div>

                  {/* Se tiver valor financeiro (Abas 3 e 4) */}
                  {['pagamento_programado', 'pago'].includes(load.status) && load.financial && (
                    <div className="bg-slate-900 rounded-2xl p-3 mb-5 flex justify-between items-center text-white">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Valor Final</span>
                        <span className="font-black text-emerald-400">
                          {load.financial.finalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Agendamento</span>
                        <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded mt-0.5">
                          {new Date(load.financial.scheduledPaymentDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer do Card */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-600">
                        {responsible?.name.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-700 leading-none">{responsible?.name?.split(' ')[0] || 'Sistema'}</span>
                        <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Clock size={8}/> {new Date(load.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {new Date(load.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDetails(load.id)}
                      className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 flex items-center justify-center transition-colors border border-slate-200 hover:border-emerald-200"
                      title="Ver Detalhes"
                    >
                      <ChevronRight size={18} strokeWidth={2.5} />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOperacao;