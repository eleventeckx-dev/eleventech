import React, { useState } from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { 
  Truck, Factory, DollarSign, CheckCircle2, Search, 
  Calendar, User, PackageSearch, PackageOpen, 
  Clock, Scale, ChevronRight, X, Leaf, Warehouse,
  Camera, MapPin, Cog, ShoppingCart, Package, CalendarDays, BadgeCheck, Edit3, Receipt, RefreshCcw
} from 'lucide-react';
import { toast } from 'sonner';

const AdminOperacao = () => {
  const { loads, producers, users, products, updateLoad, currentUser, refreshData } = useAgro();

  const isMaestroOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'maestro';

  const [editingColeta, setEditingColeta] = useState(false);
  const [coletaEditForm, setColetaEditForm] = useState({ grossWeight: 0, boxes: 0, date: '' });

  const [editingProcessing, setEditingProcessing] = useState(false);
  const [processingEditForm, setProcessingEditForm] = useState({ receivedWeight: 0, netWeight: 0, damage: 0, discard: 0 });

  // Estados dos Filtros
  const [searchId, setSearchId] = useState('');
  const [producerFilter, setProducerFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  
  // Estado da Aba Ativa
  const [activeTab, setActiveTab] = useState<'coletado' | 'beneficiado' | 'pagamento_programado' | 'pago'>('coletado');

  // Estado do Painel de Detalhes
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const [editingPaymentDate, setEditingPaymentDate] = useState(false);
  const [newPaymentDate, setNewPaymentDate] = useState('');

  // Filtro Base
  const baseFilteredLoads = loads.filter(load => {
    if (searchId && !load.id.toLowerCase().includes(searchId.toLowerCase())) return false;
    if (producerFilter !== 'all' && load.producerId !== producerFilter) return false;
    if (productFilter !== 'all' && load.collection.type.toLowerCase() !== productFilter.toLowerCase()) return false;
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

  const currentLoads = baseFilteredLoads.filter(l => l.status === activeTab);
  const selectedLoad = selectedLoadId ? loads.find(l => l.id === selectedLoadId) : null;
  const selectedProducer = selectedLoad ? producers.find(p => p.id === selectedLoad.producerId) : null;
  const selectedProduct = selectedLoad ? products.find(p => p.name.toLowerCase() === selectedLoad.collection.type.toLowerCase()) : null;
  const selectedResponsible = selectedLoad ? users.find(u => u.id === selectedLoad.collection.responsibleId) : null;

  // Definição das Etapas
  const stages = [
    { id: 'coletado', title: 'Em Trânsito / Barracão', subtitle: 'Aguardando Beneficiamento', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-500', lightBg: 'bg-blue-50', border: 'border-blue-200', count: baseFilteredLoads.filter(l => l.status === 'coletado').length },
    { id: 'beneficiado', title: 'Beneficiado', subtitle: 'Aguardando Fechamento', icon: Factory, color: 'text-violet-600', bg: 'bg-violet-500', lightBg: 'bg-violet-50', border: 'border-violet-200', count: baseFilteredLoads.filter(l => l.status === 'beneficiado').length },
    { id: 'pagamento_programado', title: 'A Pagar', subtitle: 'Pagamento Programado', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-500', lightBg: 'bg-amber-50', border: 'border-amber-200', count: baseFilteredLoads.filter(l => l.status === 'pagamento_programado').length },
    { id: 'pago', title: 'Finalizadas', subtitle: 'Acertos Concluídos', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500', lightBg: 'bg-emerald-50', border: 'border-emerald-200', count: baseFilteredLoads.filter(l => l.status === 'pago').length }
  ] as const;

  const activeStage = stages.find(s => s.id === activeTab)!;

  const statusLabels: Record<string, { label: string; color: string }> = {
    coletado: { label: 'Coletado', color: 'bg-blue-100 text-blue-700' },
    beneficiado: { label: 'Beneficiado', color: 'bg-violet-100 text-violet-700' },
    pagamento_programado: { label: 'Pagamento Programado', color: 'bg-amber-100 text-amber-700' },
    pago: { label: 'Pago', color: 'bg-emerald-100 text-emerald-700' },
  };

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-[28px] font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
              <PackageSearch size={20} className="text-brand md:hidden" />
              <PackageSearch size={24} className="text-brand hidden md:block" />
            </div>
            Central de Operações
          </h2>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
            Monitoramento em tempo real do fluxo de cargas, do campo ao financeiro.
          </p>
        </div>

        <button 
          onClick={async () => {
            const loadingToast = toast.loading('Atualizando dados...');
            try {
              if (refreshData) await refreshData();
              toast.success('Dados atualizados com sucesso!', { id: loadingToast });
            } catch (error) {
              toast.error('Erro ao atualizar os dados.', { id: loadingToast });
            }
          }} 
          className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-[1.25rem] hover:bg-slate-50 hover:border-brand-soft hover:text-brand transition-all shadow-sm text-slate-600 font-bold self-start sm:self-auto group"
        >
          <RefreshCcw size={18} className="text-slate-400 group-hover:text-brand transition-colors" />
          <span className="hidden sm:inline">Atualizar Dados</span>
          <span className="sm:hidden">Atualizar</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white/80 backdrop-blur-md p-3 md:p-5 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200 flex flex-wrap gap-3 md:gap-4 items-end">
        <div className="flex-1 min-w-[180px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Buscar ID</label>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Ex: load_123" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand-soft outline-none transition-all" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
          </div>
        </div>

        <div className="w-full md:w-auto min-w-[200px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1"><User size={12}/> Produtor</label>
          <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand-soft outline-none transition-all appearance-none" value={producerFilter} onChange={(e) => setProducerFilter(e.target.value)}>
            <option value="all">Todos os Produtores</option>
            {producers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="w-full md:w-auto min-w-[200px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1"><PackageOpen size={12}/> Produto</label>
          <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none" value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
            <option value="all">Todos os Produtos</option>
            {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>

        <div className="w-full lg:w-auto min-w-[300px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1"><Calendar size={12}/> Período de Movimentação</label>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-1">
            <input type="date" className="w-full bg-transparent px-3 py-2 text-sm font-medium text-slate-700 outline-none" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
            <span className="text-slate-300 font-bold">-</span>
            <input type="date" className="w-full bg-transparent px-3 py-2 text-sm font-medium text-slate-700 outline-none" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Sub-abas de Etapas */}
      <div className="bg-slate-200/50 p-1.5 md:p-2 rounded-2xl md:rounded-[2rem] flex overflow-x-auto custom-scrollbar gap-1.5 md:gap-2 items-center">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const isActive = activeTab === stage.id;
          return (
            <button key={stage.id} onClick={() => setActiveTab(stage.id)} className={`flex-1 min-w-[120px] md:min-w-[240px] flex items-center gap-2 md:gap-4 px-3 md:px-5 py-3 md:py-4 rounded-xl md:rounded-[1.5rem] transition-all duration-300 relative overflow-hidden group ${isActive ? 'bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-200/50' : 'hover:bg-slate-100/80 border border-transparent'}`}>
              <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 ${isActive ? stage.bg + ' text-white shadow-sm' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-200'}`}>
                <Icon size={18} className="md:hidden" strokeWidth={isActive ? 2.5 : 2} />
                <Icon size={24} className="hidden md:block" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h3 className={`font-black text-xs md:text-base leading-tight transition-colors truncate ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{stage.title}</h3>
                <p className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-0.5 transition-colors truncate ${isActive ? stage.color : 'text-slate-400'}`}>{stage.subtitle}</p>
              </div>
              <span className={`text-sm md:text-lg font-black shrink-0 px-2 md:px-3 py-0.5 md:py-1 rounded-lg md:rounded-xl transition-all ${isActive ? stage.lightBg + ' ' + stage.color : 'text-slate-400 bg-slate-100'}`}>{stage.count}</span>
              {isActive && (<div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 rounded-t-full ${stage.bg}`}></div>)}
            </button>
          );
        })}
      </div>

      {/* Título da Seção */}
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
                <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${activeStage.bg}`}></div>
                <div className="pl-3">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                      {product?.imageUrl ? (<img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />) : (<PackageOpen size={24} className="text-slate-300" />)}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">#{load.id.slice(-6)}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${activeStage.lightBg} ${activeStage.color}`}>{load.collection.category}</span>
                      </div>
                      <h4 className="font-black text-slate-800 text-[17px] leading-tight truncate" title={producer?.name}>{producer?.name}</h4>
                      <p className="text-xs font-bold text-slate-500 truncate mt-0.5">{load.collection.type}</p>
                    </div>
                  </div>

                  <div className="w-full border-t-2 border-dashed border-slate-100 my-4 relative">
                    <div className="absolute -left-5 -top-2 w-4 h-4 rounded-full bg-slate-50"></div>
                    <div className="absolute -right-5 -top-2 w-4 h-4 rounded-full bg-slate-50"></div>
                  </div>

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
                      <p className="text-sm font-black text-slate-800">{load.processing ? load.processing.netWeight : '---'} <span className="text-[10px] font-semibold opacity-60">kg</span></p>
                    </div>
                  </div>

                  {['pagamento_programado', 'pago'].includes(load.status) && load.financial && (
                    <div className="bg-slate-900 rounded-2xl p-3 mb-5 flex justify-between items-center text-white">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Valor Final</span>
                        <span className="font-black text-emerald-400">{load.financial.finalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Agendamento</span>
                        <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded mt-0.5">{new Date(load.financial.scheduledPaymentDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-600">{responsible?.name.charAt(0) || '?'}</div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-700 leading-none">{responsible?.name?.split(' ')[0] || 'Sistema'}</span>
                        <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5"><Clock size={8}/> {new Date(load.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {new Date(load.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedLoadId(load.id)} className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-brand-soft text-slate-400 hover:text-brand flex items-center justify-center transition-colors border border-slate-200 hover:border-brand-soft" title="Ver Detalhes">
                      <ChevronRight size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAINEL DE DETALHES (Slide-over) */}
      {selectedLoad && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedLoadId(null)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
          <div className="relative w-full max-w-[520px] bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Detalhes da Carga</h3>
                <p className="text-sm text-slate-500 font-medium">#{selectedLoad.id}</p>
              </div>
              <button onClick={() => {
                setSelectedLoadId(null);
                setEditingColeta(false);
                setEditingProcessing(false);
              }} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-600 transition-colors">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusLabels[selectedLoad.status]?.color}`}>
                  {statusLabels[selectedLoad.status]?.label}
                </span>
                <span className="text-xs text-slate-400 font-medium">Atualizado em {new Date(selectedLoad.updatedAt).toLocaleString('pt-BR')}</span>
              </div>

              {/* Produtor & Produto */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    {selectedProduct?.imageUrl ? (<img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />) : (<Package size={24} className="text-slate-300" />)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produtor</p>
                    <h4 className="text-lg font-black text-slate-800">{selectedProducer?.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{selectedProducer?.property}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Produto</p>
                    <p className="text-sm font-bold text-slate-700">{selectedLoad.collection.type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Categoria</p>
                    <p className="text-sm font-bold text-slate-700">{selectedLoad.collection.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Caixas</p>
                    <p className="text-sm font-bold text-slate-700">{selectedLoad.collection.boxes}</p>
                  </div>
                </div>
              </div>

              {/* Coleta */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Truck size={16} className="text-blue-600" /> Dados da Coleta
                  </h4>
                  {isMaestroOrAdmin && !editingColeta && (
                    <button onClick={() => {
                      setColetaEditForm({
                        grossWeight: selectedLoad.collection.grossWeight,
                        boxes: selectedLoad.collection.boxes,
                        date: selectedLoad.collection.date.split('T')[0]
                      });
                      setEditingColeta(true);
                    }} className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1">
                      <Edit3 size={12} /> Editar
                    </button>
                  )}
                </div>

                {editingColeta ? (
                  <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 animate-in fade-in space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Peso Roça (kg)</label>
                        <input type="number" className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                           value={coletaEditForm.grossWeight} onChange={e => setColetaEditForm({...coletaEditForm, grossWeight: Number(e.target.value)})}/>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Caixas</label>
                        <input type="number" className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                           value={coletaEditForm.boxes} onChange={e => setColetaEditForm({...coletaEditForm, boxes: Number(e.target.value)})}/>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Data</label>
                        <input type="date" className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                           value={coletaEditForm.date} onChange={e => setColetaEditForm({...coletaEditForm, date: e.target.value})}/>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button onClick={() => setEditingColeta(false)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                      <button onClick={async () => {
                        const historyItem = {
                          date: new Date().toISOString(),
                          authorId: currentUser!.id,
                          authorName: currentUser!.name,
                          action: 'editou a Coleta',
                          details: `Alterou Peso Roça de <b>${selectedLoad.collection.grossWeight}kg</b> para <b>${coletaEditForm.grossWeight}kg</b>. Caixas de <b>${selectedLoad.collection.boxes}</b> para <b>${coletaEditForm.boxes}</b>.`
                        };
                        await updateLoad(selectedLoad.id, {
                          collection: {
                            ...selectedLoad.collection,
                            grossWeight: coletaEditForm.grossWeight,
                            boxes: coletaEditForm.boxes,
                            date: new Date(coletaEditForm.date).toISOString()
                          },
                          editHistory: [...(selectedLoad.editHistory || []), historyItem]
                        });
                        setEditingColeta(false);
                        toast.success('Coleta atualizada!');
                      }} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm">Salvar Alterações</button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Peso Roça</p>
                      <p className="text-lg font-black text-slate-800">{selectedLoad.collection.grossWeight} <span className="text-xs text-slate-400">kg</span></p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Data</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(selectedLoad.collection.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin size={12} /> {selectedLoad.collection.location}
                </div>
                {selectedResponsible && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User size={12} /> Responsável: <strong>{selectedResponsible.name}</strong>
                  </div>
                )}
                
                {selectedLoad.collection.photos && selectedLoad.collection.photos.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-slate-400 border-b border-slate-100 pb-1 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Camera size={12}/> Fotos da Roça</p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedLoad.collection.photos.map(photo => (
                        <div key={photo.id} className="aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                          <img src={photo.url} alt="Evidência Coleta" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Beneficiamento */}
              {selectedLoad.processing && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Factory size={16} className="text-violet-600" /> Beneficiamento
                    </h4>
                    {isMaestroOrAdmin && !editingProcessing && (
                      <button onClick={() => {
                        setProcessingEditForm({
                          receivedWeight: selectedLoad.processing!.receivedWeight,
                          netWeight: selectedLoad.processing!.netWeight,
                          damage: selectedLoad.processing!.damage,
                          discard: selectedLoad.processing!.discard
                        });
                        setEditingProcessing(true);
                      }} className="text-xs font-bold text-slate-400 hover:text-violet-600 transition-colors flex items-center gap-1">
                        <Edit3 size={12} /> Editar
                      </button>
                    )}
                  </div>

                  {editingProcessing ? (
                    <div className="bg-violet-50/50 border border-violet-200 rounded-xl p-4 animate-in fade-in space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Peso Recebido</label>
                          <input type="number" className="w-full bg-white border border-violet-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-violet-400"
                             value={processingEditForm.receivedWeight} onChange={e => setProcessingEditForm({...processingEditForm, receivedWeight: Number(e.target.value)})}/>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Peso Líquido</label>
                          <input type="number" className="w-full bg-white border border-violet-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-violet-400"
                             value={processingEditForm.netWeight} onChange={e => setProcessingEditForm({...processingEditForm, netWeight: Number(e.target.value)})}/>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Avarias</label>
                          <input type="number" className="w-full bg-white border border-violet-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-violet-400"
                             value={processingEditForm.damage} onChange={e => setProcessingEditForm({...processingEditForm, damage: Number(e.target.value)})}/>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Descarte</label>
                          <input type="number" className="w-full bg-white border border-violet-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-violet-400"
                             value={processingEditForm.discard} onChange={e => setProcessingEditForm({...processingEditForm, discard: Number(e.target.value)})}/>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <button onClick={() => setEditingProcessing(false)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                        <button onClick={async () => {
                          const historyItem = {
                            date: new Date().toISOString(),
                            authorId: currentUser!.id,
                            authorName: currentUser!.name,
                            action: 'editou o Beneficiamento',
                            details: `Alterou Recebido de <b>${selectedLoad.processing!.receivedWeight}kg</b> para <b>${processingEditForm.receivedWeight}kg</b> e Líquido de <b>${selectedLoad.processing!.netWeight}kg</b> para <b>${processingEditForm.netWeight}kg</b>.`
                          };
                          await updateLoad(selectedLoad.id, {
                            processing: {
                              ...selectedLoad.processing!,
                              receivedWeight: processingEditForm.receivedWeight,
                              netWeight: processingEditForm.netWeight,
                              damage: processingEditForm.damage,
                              discard: processingEditForm.discard,
                              weightDifference: processingEditForm.receivedWeight - processingEditForm.netWeight
                            },
                            editHistory: [...(selectedLoad.editHistory || []), historyItem]
                          });
                          setEditingProcessing(false);
                          toast.success('Beneficiamento atualizado!');
                        }} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-sm">Salvar Alterações</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-violet-50/50 border border-violet-100 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-1">Peso Recebido</p>
                        <p className="text-lg font-black text-slate-800">{selectedLoad.processing.receivedWeight} <span className="text-xs text-slate-400">kg</span></p>
                      </div>
                      <div className="bg-violet-50/50 border border-violet-100 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-1">Peso Líquido</p>
                        <p className="text-lg font-black text-slate-800">{selectedLoad.processing.netWeight} <span className="text-xs text-slate-400">kg</span></p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Avarias</p>
                      <p className="text-sm font-black text-slate-700">{selectedLoad.processing.damage} kg</p>
                    </div>
                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Descarte</p>
                      <p className="text-sm font-black text-slate-700">{selectedLoad.processing.discard} kg</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Diferença</p>
                      <p className={`text-sm font-black ${selectedLoad.processing.weightDifference < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {selectedLoad.processing.weightDifference > 0 ? '+' : ''}{selectedLoad.processing.weightDifference} kg
                      </p>
                    </div>
                  </div>

                  {/* Classificação Verde */}
                  {(selectedLoad.processing.greenWeight || 0) > 0 && (
                    <div className="bg-lime-50/50 border border-lime-200 rounded-xl p-3 flex items-center gap-3">
                      <Leaf size={18} className="text-lime-600 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-lime-700 uppercase tracking-widest">Produtos Verdes</p>
                        <p className="text-sm font-black text-slate-700">{selectedLoad.processing.greenWeight} kg</p>
                      </div>
                    </div>
                  )}

                  {/* Destinação */}
                  {((selectedLoad.processing.stockWeight || 0) > 0 || (selectedLoad.processing.productionWeight || 0) > 0 || (selectedLoad.processing.bulkSaleWeight || 0) > 0) && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Destinação</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(selectedLoad.processing.stockWeight || 0) > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center">
                            <Warehouse size={14} className="text-amber-600 mx-auto mb-1" />
                            <p className="text-[9px] font-bold text-amber-700 uppercase">Estoque</p>
                            <p className="text-sm font-black text-slate-700">{selectedLoad.processing.stockWeight} kg</p>
                          </div>
                        )}
                        {(selectedLoad.processing.productionWeight || 0) > 0 && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center">
                            <Cog size={14} className="text-emerald-600 mx-auto mb-1" />
                            <p className="text-[9px] font-bold text-emerald-700 uppercase">Produção</p>
                            <p className="text-sm font-black text-slate-700">{selectedLoad.processing.productionWeight} kg</p>
                          </div>
                        )}
                        {(selectedLoad.processing.bulkSaleWeight || 0) > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-center">
                            <ShoppingCart size={14} className="text-blue-600 mx-auto mb-1" />
                            <p className="text-[9px] font-bold text-blue-700 uppercase">Granel</p>
                            <p className="text-sm font-black text-slate-700">{selectedLoad.processing.bulkSaleWeight} kg</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedLoad.processing.observations && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Observações</p>
                      <p className="text-sm text-slate-600">{selectedLoad.processing.observations}</p>
                    </div>
                  )}

                  {selectedLoad.processing.photos.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Camera size={12}/> Evidências</p>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedLoad.processing.photos.map(photo => (
                          <div key={photo.id} className="aspect-square rounded-xl overflow-hidden border border-slate-200">
                            <img src={photo.url} alt="Evidência" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Financeiro */}
              {selectedLoad.financial && (
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <DollarSign size={16} className="text-amber-600" /> Financeiro
                  </h4>
                  <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preço/kg</p>
                        <p className="text-lg font-bold text-white">R$ {selectedLoad.financial.pricePerKg.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descontos</p>
                        <p className="text-lg font-bold text-red-400">-R$ {selectedLoad.financial.discounts.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total a Pagar</p>
                        <p className="text-2xl font-black text-emerald-400">
                          {selectedLoad.financial.finalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agendamento</p>
                        <p className="text-sm font-bold text-white bg-white/10 px-3 py-1 rounded-lg">
                          {new Date(selectedLoad.financial.scheduledPaymentDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </p>
                      </div>
                    </div>
                    {selectedLoad.financial.saleType && (
                      <div className="pt-2 border-t border-white/10">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${selectedLoad.financial.saleType === 'granel' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                          {selectedLoad.financial.saleType === 'granel' ? 'Venda a Granel' : 'Produção'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ações Financeiras */}
                  {selectedLoad.status !== 'pago' && (
                    <div className="space-y-3 mt-4">
                      <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">Ações do Financeiro</h4>

                      {/* Alterar Data de Pagamento */}
                      {!editingPaymentDate ? (
                        <button
                          onClick={() => {
                            setEditingPaymentDate(true);
                            setNewPaymentDate(selectedLoad.financial!.scheduledPaymentDate.split('T')[0]);
                          }}
                          className="w-full flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-amber-300 hover:bg-amber-50/50 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition">
                            <CalendarDays size={20} />
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-sm font-bold text-slate-800">Alterar Data de Pagamento</p>
                            <p className="text-[10px] text-slate-400 font-medium">Reagendar pagamento desta carga</p>
                          </div>
                          <Edit3 size={16} className="text-slate-300 group-hover:text-amber-500 transition" />
                        </button>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                          <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
                            <CalendarDays size={16} /> Nova Data de Pagamento
                          </div>
                          <input
                            type="date"
                            value={newPaymentDate}
                            onChange={(e) => setNewPaymentDate(e.target.value)}
                            className="w-full bg-white border border-amber-200 focus:border-brand focus:ring-4 focus:ring-brand-soft rounded-xl px-4 py-3 outline-none transition-all text-slate-800 font-medium"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingPaymentDate(false)}
                              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => {
                                if (!newPaymentDate) return;
                                updateLoad(selectedLoad.id, {
                                  financial: { ...selectedLoad.financial!, scheduledPaymentDate: new Date(newPaymentDate + 'T00:00:00Z').toISOString() }
                                });
                                setEditingPaymentDate(false);
                                toast.success('Data de pagamento atualizada!', { description: `Novo agendamento: ${new Date(newPaymentDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}` });
                              }}
                              disabled={!newPaymentDate}
                              className="flex-1 px-4 py-2.5 bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition shadow-lg shadow-amber-500/20"
                            >
                              Salvar Data
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Marcar como Pago */}
                      {selectedLoad.status === 'pagamento_programado' && (
                        <button
                          onClick={() => {
                            updateLoad(selectedLoad.id, { 
                              status: 'pago',
                              payment: {
                                id: `pay_${Date.now()}`,
                                paymentDate: new Date().toISOString()
                              }
                            });
                            toast.success('Pagamento confirmado!', {
                              description: `Carga #${selectedLoad.id.slice(-6)} marcada como paga.`
                            });
                          }}
                          className="w-full flex items-center gap-3 p-4 bg-emerald-600 border border-emerald-500 rounded-2xl hover:bg-emerald-700 transition-all group text-white shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <BadgeCheck size={22} />
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-sm font-bold">Confirmar Pagamento</p>
                            <p className="text-[10px] text-emerald-200 font-medium">Marcar esta carga como paga</p>
                          </div>
                          <CheckCircle2 size={20} className="text-emerald-200" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Badge Pago & Comprovante */}
                  {selectedLoad.status === 'pago' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                        <BadgeCheck size={24} className="text-emerald-600" />
                        <div>
                          <p className="text-sm font-bold text-emerald-800">Pagamento Concluído</p>
                          <p className="text-[10px] text-emerald-600 font-medium">Esta carga já foi quitada em {selectedLoad.payment?.paymentDate ? new Date(selectedLoad.payment.paymentDate).toLocaleDateString('pt-BR') : '---'}.</p>
                        </div>
                      </div>

                      {selectedLoad.payment?.comprovanteUrl && (
                        <div className="space-y-3">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Receipt size={12}/> Comprovante de Pagamento</p>
                           <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative group shadow-sm">
                             <img src={selectedLoad.payment.comprovanteUrl} alt="Comprovante" className="w-full h-full object-contain" />
                             <a 
                               href={selectedLoad.payment.comprovanteUrl} 
                               target="_blank"
                               rel="noopener noreferrer"
                               className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-2"
                             >
                               <Package size={16} /> Ver em Tamanho Real
                             </a>
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-3 pb-8">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Clock size={16} className="text-slate-500" /> Histórico
                </h4>
                <div className="space-y-0">
                  {[
                    { label: 'Coleta registrada', date: selectedLoad.collection.date, done: true },
                    { label: 'Beneficiamento realizado', date: selectedLoad.processing ? selectedLoad.updatedAt : null, done: !!selectedLoad.processing },
                    { label: 'Acerto financeiro', date: selectedLoad.financial ? selectedLoad.updatedAt : null, done: !!selectedLoad.financial },
                    { label: 'Pagamento concluído', date: selectedLoad.status === 'pago' ? selectedLoad.updatedAt : null, done: selectedLoad.status === 'pago' },
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 relative">
                      {idx < 3 && <div className={`absolute left-[9px] top-5 w-0.5 h-full ${step.done ? 'bg-emerald-300' : 'bg-slate-200'}`}></div>}
                      <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-0.5 z-10 ${step.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {step.done ? <CheckCircle2 size={12} /> : <div className="w-2 h-2 rounded-full bg-slate-300"></div>}
                      </div>
                      <div className="pb-5">
                        <p className={`text-sm font-bold ${step.done ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
                        {step.date && <p className="text-[10px] text-slate-400 font-medium">{new Date(step.date).toLocaleString('pt-BR')}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Histórico de Auditoria */}
              {selectedLoad.editHistory && selectedLoad.editHistory.length > 0 && (
                <div className="space-y-3 pb-8">
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Edit3 size={16} className="text-slate-500" /> Trilha de Auditoria
                  </h4>
                  <div className="space-y-2">
                    {selectedLoad.editHistory.map((edit, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm flex items-start gap-3 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-400"></div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-800 flex items-center justify-between">
                            <span>{edit.authorName}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{new Date(edit.date).toLocaleString('pt-BR')}</span>
                          </p>
                          <p className="text-xs text-slate-600 mb-1">{edit.action}</p>
                          <p className="text-[11px] text-slate-500 font-medium bg-white border border-slate-100 p-2 rounded-lg" dangerouslySetInnerHTML={{ __html: edit.details }}></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOperacao;