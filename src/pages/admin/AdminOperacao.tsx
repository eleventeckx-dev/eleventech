import React, { useState } from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { 
  Truck, Factory, DollarSign, CheckCircle2, Eye, Search, 
  Filter, Calendar, User, PackageSearch, PackageOpen, 
  Clock, MapPin, Scale, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const AdminOperacao = () => {
  const { loads, producers, users, products } = useAgro();

  // Estados dos Filtros
  const [searchId, setSearchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [producerFilter, setProducerFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Aplicação dos Filtros
  const filteredLoads = loads.filter(load => {
    if (searchId && !load.id.toLowerCase().includes(searchId.toLowerCase())) return false;
    if (statusFilter !== 'all' && load.status !== statusFilter) return false;
    if (producerFilter !== 'all' && load.producerId !== producerFilter) return false;
    if (userFilter !== 'all' && load.collection.responsibleId !== userFilter) return false;
    
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

  const handleDetails = (loadId: string) => {
    toast.info(`Painel de Detalhes da Carga #${loadId.slice(-6).toUpperCase()}`, {
      description: 'A visualização completa de histórico e fotos será aberta em breve.'
    });
  };

  // Definição das colunas (Kanban Premium)
  const columns = [
    {
      id: 'coletado',
      title: 'Em Trânsito / Barracão',
      subtitle: 'Aguardando Beneficiamento',
      icon: Truck,
      color: 'text-blue-600',
      bg: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      border: 'border-blue-200',
      loads: filteredLoads.filter(l => l.status === 'coletado')
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
      loads: filteredLoads.filter(l => l.status === 'beneficiado')
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
      loads: filteredLoads.filter(l => l.status === 'pagamento_programado')
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
      loads: filteredLoads.filter(l => l.status === 'pago')
    }
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      
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

      {/* Barra de Filtros Premium */}
      <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
        
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">ID da Carga</label>
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

        <div className="w-full md:w-auto min-w-[160px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1"><Filter size={12}/> Status</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value="coletado">Em Trânsito/Barracão</option>
            <option value="beneficiado">Beneficiado</option>
            <option value="pagamento_programado">A Pagar</option>
            <option value="pago">Finalizadas</option>
          </select>
        </div>

        <div className="w-full md:w-auto min-w-[180px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1"><User size={12}/> Produtor</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none"
            value={producerFilter}
            onChange={(e) => setProducerFilter(e.target.value)}
          >
            <option value="all">Todos Produtores</option>
            {producers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="w-full lg:w-auto min-w-[280px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1"><Calendar size={12}/> Período</label>
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

      {/* Board Kanban Premium */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-6 pb-4 custom-scrollbar">
        {columns.map((col) => {
          const Icon = col.icon;
          return (
            <div key={col.id} className="w-[380px] flex-shrink-0 flex flex-col h-full bg-slate-100/50 rounded-[2rem] border border-slate-200/60 overflow-hidden relative">
              
              {/* Header da Coluna */}
              <div className={`p-5 backdrop-blur-md bg-white/60 border-b border-slate-200/60 sticky top-0 z-10`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${col.bg} text-white`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 tracking-tight text-lg leading-tight">{col.title}</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{col.subtitle}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-black text-slate-700 bg-white shadow-sm border border-slate-100 px-3 py-1 rounded-full`}>
                    {col.loads.length}
                  </span>
                </div>
                {/* Progress bar sutil */}
                <div className="w-full h-1 bg-slate-100 rounded-full mt-4 overflow-hidden">
                  <div className={`h-full rounded-full ${col.bg}`} style={{ width: col.loads.length > 0 ? '100%' : '0%', opacity: 0.3 }}></div>
                </div>
              </div>

              {/* Corpo da Coluna */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {col.loads.map((load, i) => {
                  const producer = producers.find(p => p.id === load.producerId);
                  const responsible = users.find(u => u.id === load.collection.responsibleId);
                  // Tenta achar a imagem do produto batendo o nome com o tipo cadastrado
                  const product = products.find(p => p.name.toLowerCase() === load.collection.type.toLowerCase());
                  
                  return (
                    <div 
                      key={load.id} 
                      className={`bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 group relative animate-in fade-in slide-in-from-bottom-4`}
                      style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                    >
                      {/* Faixa Lateral de Status */}
                      <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${col.bg}`}></div>

                      <div className="pl-3">
                        
                        {/* Ticket Header: Produto & Produtor */}
                        <div className="flex items-start gap-3 mb-4">
                          {/* Imagem do Produto */}
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                            {product?.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <PackageOpen size={20} className="text-slate-300" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">
                                #{load.id.slice(-6)}
                              </span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${col.lightBg} ${col.color}`}>
                                {load.collection.category}
                              </span>
                            </div>
                            <h4 className="font-black text-slate-800 text-base leading-tight mt-1.5 truncate" title={producer?.name}>
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
                          <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100/50">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Scale size={12} className="text-slate-400" />
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Peso Roça</p>
                            </div>
                            <p className="text-sm font-black text-slate-700">{load.collection.grossWeight} <span className="text-[10px] font-semibold text-slate-400">kg</span></p>
                          </div>
                          
                          <div className={`rounded-2xl p-3 border ${['beneficiado', 'pagamento_programado', 'pago'].includes(load.status) ? col.lightBg + ' ' + col.border : 'bg-slate-50/80 border-slate-100/50'}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <CheckCircle2 size={12} className={['beneficiado', 'pagamento_programado', 'pago'].includes(load.status) ? col.color : 'text-slate-400'} />
                              <p className={`text-[9px] font-bold uppercase tracking-widest ${['beneficiado', 'pagamento_programado', 'pago'].includes(load.status) ? col.color : 'text-slate-500'}`}>Peso Líquido</p>
                            </div>
                            <p className="text-sm font-black text-slate-800">
                              {load.processing ? load.processing.netWeight : '---'} <span className="text-[10px] font-semibold opacity-60">kg</span>
                            </p>
                          </div>
                        </div>

                        {/* Footer do Card */}
                        <div className="flex items-center justify-between mt-2 pt-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-[9px] font-black text-slate-600">
                              {responsible?.name.charAt(0) || '?'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-700 leading-none">{responsible?.name?.split(' ')[0] || 'Sistema'}</span>
                              <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                                <Clock size={8}/> {new Date(load.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
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

                {col.loads.length === 0 && (
                  <div className="h-40 flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-200/60 rounded-[24px] bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Icon size={24} className="opacity-40" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Lista Vazia</span>
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