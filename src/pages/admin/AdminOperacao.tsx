import React, { useState } from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Truck, Factory, DollarSign, CheckCircle2, Eye, Search, Filter, Calendar, User, PackageSearch } from 'lucide-react';
import { toast } from 'sonner';

const AdminOperacao = () => {
  const { loads, producers, users } = useAgro();

  // Estados dos Filtros
  const [searchId, setSearchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [producerFilter, setProducerFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Aplicação dos Filtros
  const filteredLoads = loads.filter(load => {
    // Busca por ID
    if (searchId && !load.id.toLowerCase().includes(searchId.toLowerCase())) return false;
    
    // Filtro por Status
    if (statusFilter !== 'all' && load.status !== statusFilter) return false;
    
    // Filtro por Produtor
    if (producerFilter !== 'all' && load.producerId !== producerFilter) return false;
    
    // Filtro por Responsável (Usamos o responsável pela coleta como base primária, ou da última etapa se houvesse na modelagem)
    if (userFilter !== 'all' && load.collection.responsibleId !== userFilter) return false;
    
    // Filtro por Período (Baseado na última atualização)
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
    toast.info(`Abrindo painel de detalhes completos da carga #${loadId.slice(-6).toUpperCase()}`, {
      description: 'Esta visualização trará todo o histórico e fotos da carga.'
    });
  };

  // Definição das colunas (Kanban Read-Only)
  const columns = [
    {
      id: 'coletado',
      title: 'Coletado (Aguard. Beneficiamento)',
      icon: Truck,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      badgeBg: 'bg-blue-600',
      loads: filteredLoads.filter(l => l.status === 'coletado')
    },
    {
      id: 'beneficiado',
      title: 'Beneficiado (Aguard. Financeiro)',
      icon: Factory,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
      badgeBg: 'bg-indigo-600',
      loads: filteredLoads.filter(l => l.status === 'beneficiado')
    },
    {
      id: 'pagamento_programado',
      title: 'Pagamento Programado',
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      badgeBg: 'bg-amber-500',
      loads: filteredLoads.filter(l => l.status === 'pagamento_programado')
    },
    {
      id: 'pago',
      title: 'Cargas Pagas / Finalizadas',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      badgeBg: 'bg-emerald-600',
      loads: filteredLoads.filter(l => l.status === 'pago')
    }
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      
      {/* Cabeçalho Descritivo */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <PackageSearch size={28} className="text-emerald-600" /> Operação
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Painel de acompanhamento do fluxo operacional. Utilize os filtros para visualizar cargas, responsáveis e períodos.
        </p>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Busca por ID */}
        <div className="space-y-1 lg:col-span-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ID da Carga</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Ex: load_123" 
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
        </div>

        {/* Filtro por Status */}
        <div className="space-y-1 lg:col-span-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Filter size={12}/> Status</label>
          <select 
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value="coletado">Coletado</option>
            <option value="beneficiado">Beneficiado</option>
            <option value="pagamento_programado">Pagam. Programado</option>
            <option value="pago">Pago</option>
          </select>
        </div>

        {/* Filtro por Produtor */}
        <div className="space-y-1 lg:col-span-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><User size={12}/> Produtor</label>
          <select 
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
            value={producerFilter}
            onChange={(e) => setProducerFilter(e.target.value)}
          >
            <option value="all">Todos os Produtores</option>
            {producers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Filtro por Responsável */}
        <div className="space-y-1 lg:col-span-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><User size={12}/> Responsável</label>
          <select 
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="all">Todos os Usuários</option>
            {users.filter(u => u.role !== 'super_admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>

        {/* Filtro por Período */}
        <div className="space-y-1 lg:col-span-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Calendar size={12}/> Período (Atualização)</label>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
            <span className="text-slate-400 text-sm">até</span>
            <input 
              type="date" 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
          </div>
        </div>

      </div>

      {/* Board de Monitoramento (Kanban Read-Only) */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-6 pb-4 custom-scrollbar">
        {columns.map((col) => {
          const Icon = col.icon;
          return (
            <div key={col.id} className="w-[360px] flex-shrink-0 flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200 overflow-hidden">
              
              {/* Column Header */}
              <div className="p-4 border-b border-slate-200 bg-white/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${col.bg} ${col.color}`}>
                    <Icon size={16} strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-slate-700 text-sm">{col.title}</h3>
                </div>
                <span className={`text-xs font-bold text-white px-2.5 py-1 rounded-full ${col.badgeBg}`}>
                  {col.loads.length}
                </span>
              </div>

              {/* Column Body (Scrollable Cards) */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {col.loads.map(load => {
                  const producer = producers.find(p => p.id === load.producerId);
                  const responsible = users.find(u => u.id === load.collection.responsibleId);
                  
                  return (
                    <div key={load.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                      
                      {/* Faixa lateral indicativa de status */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${col.badgeBg}`}></div>

                      <div className="pl-2">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">ID: {load.id.slice(-8)}</p>
                            <p className="font-bold text-slate-800 leading-tight">{producer?.name}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-500`}>
                            {load.collection.type}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase">Peso Info</p>
                            <p className="text-sm font-bold text-slate-700">
                              {load.status === 'coletado' ? load.collection.grossWeight : load.processing?.netWeight} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase">Atualizado em</p>
                            <p className="text-sm font-bold text-slate-700">
                              {new Date(load.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                              {responsible?.name.charAt(0) || '?'}
                            </div>
                            <span className="text-xs text-slate-500 font-medium truncate max-w-[120px]">
                              {responsible?.name || 'Sistema'}
                            </span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDetails(load.id)}
                          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 transition-colors border border-emerald-200"
                        >
                          <Eye size={16} /> Ver detalhes completos
                        </button>
                      </div>

                    </div>
                  );
                })}

                {col.loads.length === 0 && (
                  <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <Icon size={24} className="opacity-50" />
                    <span className="text-xs font-medium">Nenhuma carga encontrada</span>
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