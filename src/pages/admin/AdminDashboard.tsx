import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAgro } from '../../contexts/AgroContext';
import { 
  Truck, DollarSign, AlertTriangle, Package, Users, 
  Activity, UsersRound, Settings, Zap, TrendingUp,
  Scale, BarChart3, ArrowUpRight, ArrowDownRight, 
  Leaf, Factory, CheckCircle2, Clock
} from 'lucide-react';
import { aggregateUnitPerformance } from './adminDashboardMetrics';

const AdminDashboard = () => {
  const { loads, producers, producerUnits, currentUser } = useAgro();
  const { companySlug } = useParams<{ companySlug: string }>();
  const [unitProducerFilter, setUnitProducerFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');

  // Filtrar dados pela empresa do admin logado
  const companyLoads = useMemo(() => loads.filter(l => l.companyId === currentUser?.companyId), [loads, currentUser?.companyId]);
  const companyProducers = useMemo(() => producers.filter(p => p.companyId === currentUser?.companyId), [producers, currentUser?.companyId]);
  const companyProducerUnits = useMemo(() => producerUnits.filter(u => u.companyId === currentUser?.companyId), [producerUnits, currentUser?.companyId]);

  const producerById = useMemo(() => {
    return new Map(companyProducers.map(producer => [producer.id, producer]));
  }, [companyProducers]);

  const unitById = useMemo(() => {
    return new Map(companyProducerUnits.map(unit => [unit.id, unit]));
  }, [companyProducerUnits]);

  // ================================================================
  // CÁLCULOS DE INSIGHTS
  // ================================================================
  const insights = useMemo(() => {
    const totalLoads = companyLoads.length;
    const totalGrossWeight = companyLoads.reduce((acc, l) => acc + (l.collection?.grossWeight || 0), 0);
    const totalBoxes = companyLoads.reduce((acc, l) => acc + (l.collection?.boxes || 0), 0);

    // Quebra (Loss) — avarias + descarte sobre peso bruto recebido
    const processedLoads = companyLoads.filter(l => l.processing);
    const totalReceivedWeight = processedLoads.reduce((acc, l) => acc + (l.processing!.receivedWeight || 0), 0);
    const totalDamage = processedLoads.reduce((acc, l) => acc + (l.processing!.damage || 0), 0);
    const totalDiscard = processedLoads.reduce((acc, l) => acc + (l.processing!.discard || 0), 0);
    const totalLoss = totalDamage + totalDiscard;
    const lossPercentage = totalReceivedWeight > 0 ? (totalLoss / totalReceivedWeight) * 100 : 0;
    const totalNetWeight = processedLoads.reduce((acc, l) => acc + (l.processing!.netWeight || 0), 0);

    // Financeiro
    const financialLoads = companyLoads.filter(l => l.financial);
    const totalRevenue = financialLoads.reduce((acc, l) => acc + (l.financial!.finalValue || 0), 0);
    const pendingPayment = companyLoads
      .filter(l => l.status === 'pagamento_programado')
      .reduce((acc, l) => acc + (l.financial?.finalValue || 0), 0);
    const totalPaid = companyLoads
      .filter(l => l.status === 'pago')
      .reduce((acc, l) => acc + (l.financial?.finalValue || 0), 0);
    const avgPricePerKg = financialLoads.length > 0
      ? financialLoads.reduce((acc, l) => acc + (l.financial!.pricePerKg || 0), 0) / financialLoads.length
      : 0;

    // Pipeline por status
    const pipeline = {
      coletado: companyLoads.filter(l => l.status === 'coletado').length,
      beneficiado: companyLoads.filter(l => l.status === 'beneficiado').length,
      pagamento_programado: companyLoads.filter(l => l.status === 'pagamento_programado').length,
      pago: companyLoads.filter(l => l.status === 'pago').length,
    };

    // Volume por produto (top 5)
    const productVolumes: Record<string, number> = {};
    companyLoads.forEach(l => {
      const name = l.collection?.type || 'Outros';
      productVolumes[name] = (productVolumes[name] || 0) + (l.collection?.grossWeight || 0);
    });
    const topProducts = Object.entries(productVolumes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    const maxProductVolume = topProducts.length > 0 ? topProducts[0][1] : 1;

    // Ranking de produtores (top 5 por volume)
    const producerVolumes: Record<string, { name: string; weight: number; loads: number }> = {};
    companyLoads.forEach(l => {
      const prod = producerById.get(l.producerId);
      if (!prod) return;
      if (!producerVolumes[prod.id]) {
        producerVolumes[prod.id] = { name: prod.name, weight: 0, loads: 0 };
      }
      producerVolumes[prod.id].weight += l.collection?.grossWeight || 0;
      producerVolumes[prod.id].loads += 1;
    });
    const topProducers = Object.values(producerVolumes)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);

    return {
      totalLoads, totalGrossWeight, totalBoxes,
      totalLoss, lossPercentage, totalNetWeight,
      totalRevenue, pendingPayment, totalPaid, avgPricePerKg,
      pipeline, topProducts, maxProductVolume, topProducers,
      processedCount: processedLoads.length,
    };
  }, [companyLoads, producerById]);

  // Desempenho por unidade / roça
  const unitPerformance = useMemo(() => {
    return aggregateUnitPerformance(companyLoads, producerById, unitById);
  }, [companyLoads, producerById, unitById]);

  const unitFilterOptions = useMemo(() => {
    return unitPerformance
      .filter(row => unitProducerFilter === 'all' || row.producerId === unitProducerFilter)
      .sort((a, b) => a.unitName.localeCompare(b.unitName));
  }, [unitPerformance, unitProducerFilter]);

  const filteredUnitPerformance = useMemo(() => {
    return unitPerformance.filter(row => {
      const matchesProducer = unitProducerFilter === 'all' || row.producerId === unitProducerFilter;
      const matchesUnit = unitFilter === 'all' || row.key === unitFilter;
      return matchesProducer && matchesUnit;
    });
  }, [unitPerformance, unitProducerFilter, unitFilter]);

  const unitPerformanceHighlights = useMemo(() => {
    const byVolume = [...filteredUnitPerformance].sort((a, b) => b.grossWeight - a.grossWeight)[0];
    const byLoss = [...filteredUnitPerformance]
      .filter(row => row.receivedWeight > 0)
      .sort((a, b) => b.lossPercentage - a.lossPercentage)[0];
    const byFinancial = [...filteredUnitPerformance].sort((a, b) => b.financialValue - a.financialValue)[0];
    const legacyLoadCount = filteredUnitPerformance
      .filter(row => row.isLegacy)
      .reduce((acc, row) => acc + row.loadCount, 0);

    return { byVolume, byLoss, byFinancial, legacyLoadCount };
  }, [filteredUnitPerformance]);

  const unitFiltersActive = unitProducerFilter !== 'all' || unitFilter !== 'all';

  // Pagamentos a Vencer em até 3 dias (ou vencidos)
  const upcomingPayments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 3);
    maxDate.setHours(23, 59, 59, 999);

    return companyLoads
      .filter(l => l.status === 'pagamento_programado' && l.financial && l.financial.scheduledPaymentDate)
      .filter(l => {
        const payDateStr = l.financial!.scheduledPaymentDate;
        let payDate;
        if (payDateStr.includes('-')) {
          const [y, m, d] = payDateStr.split('T')[0].split('-');
          payDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        } else {
          payDate = new Date(payDateStr);
        }
        return payDate <= maxDate;
      })
      .map(l => {
        const prod = producerById.get(l.producerId);
        
        const payDateStr = l.financial!.scheduledPaymentDate;
        let payDate: Date;
        if (payDateStr.includes('-')) {
          const [y, m, d] = payDateStr.split('T')[0].split('-');
          payDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        } else {
          payDate = new Date(payDateStr);
        }
        
        const diffTime = payDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          load: l,
          producerName: prod?.name || 'Produtor Desconhecido',
          unitName: l.collection.producerUnitName || l.collection.location || '',
          value: l.financial!.finalValue || 0,
          dateStr: l.financial!.scheduledPaymentDate,
          daysLeft: diffDays
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [companyLoads, producerById]);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtKg = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v);

  // Atalhos rápidos
  const shortcuts = [
    { name: 'Central de Operações', path: `/${companySlug}/app/operacao`, icon: Activity, color: 'text-brand', bg: 'bg-brand-soft', hover: 'hover:border-brand-soft hover:shadow-brand-soft' },
    { name: 'Gerenciar Usuários', path: `/${companySlug}/app/usuarios`, icon: UsersRound, color: 'text-indigo-600', bg: 'bg-indigo-50', hover: 'hover:border-indigo-200 hover:shadow-indigo-500/10' },
    { name: 'Ajustes do Sistema', path: `/${companySlug}/app/configuracoes`, icon: Settings, color: 'text-slate-600', bg: 'bg-slate-100', hover: 'hover:border-slate-300 hover:shadow-slate-500/10' },
  ];

  return (
    <div className="space-y-8">

      {/* ALERTA FINANCEIRO (Vencimento até 3 dias) */}
      {upcomingPayments.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Pagamentos Próximos ao Vencimento</h2>
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{upcomingPayments.length} ALERTA{upcomingPayments.length > 1 ? 'S' : ''}</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingPayments.map((item, idx) => (
              <div key={`alert-${item.load.id}-${idx}`} className={`bg-white border-l-4 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${item.daysLeft < 0 ? 'border-red-500' : item.daysLeft === 0 ? 'border-orange-500' : 'border-amber-400'}`}>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-slate-500 truncate max-w-[70%]">{item.producerName}</p>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    item.daysLeft < 0 ? 'bg-red-50 text-red-600' : item.daysLeft === 0 ? 'bg-orange-50 text-orange-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {item.daysLeft < 0 ? `Vencido há ${Math.abs(item.daysLeft)} d` : item.daysLeft === 0 ? 'Vence HOJE' : `Em ${item.daysLeft} d`}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}</h3>
                {item.unitName && <p className="text-[10px] font-bold text-slate-400 truncate mt-1">{item.unitName}</p>}
                <Link to={`/${companySlug}/app/financeiro`} className="absolute inset-0 z-10" title="Ver no Módulo Financeiro"></Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ROW 1: KPIs Principais (4 cards) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {/* Volume Total */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Volume Total</p>
              <h3 className="text-2xl font-black text-slate-800">{fmtKg(insights.totalGrossWeight)} <span className="text-sm font-bold text-slate-400">kg</span></h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1">
                <Package size={12} className="text-slate-400" /> {fmtKg(insights.totalBoxes)} caixas • {insights.totalLoads} cargas
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--primary-color), white 90%)' }}>
              <Scale size={22} style={{ color: 'var(--primary-color)' }} />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" style={{ backgroundColor: 'var(--primary-color)' }} />
        </div>

        {/* Custo Médio / KG */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Preço Médio / Kg</p>
              <h3 className="text-2xl font-black text-slate-800">R$ {insights.avgPricePerKg.toFixed(2)}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1">
                <TrendingUp size={12} className="text-emerald-500" /> Base de {insights.processedCount} cargas processadas
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <DollarSign size={22} className="text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Receita Acumulada */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Receita Total</p>
              <h3 className="text-2xl font-black text-slate-800">{fmt(insights.totalRevenue)}</h3>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">A pagar: {fmt(insights.pendingPayment)}</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <DollarSign size={22} className="text-amber-600" />
            </div>
          </div>
        </div>

        {/* Quebra (Loss) */}
        <div className={`p-5 rounded-2xl shadow-sm border relative overflow-hidden group hover:shadow-md transition-shadow ${insights.lossPercentage > 10 ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Quebra (Perda)</p>
              <h3 className={`text-2xl font-black ${insights.lossPercentage > 10 ? 'text-red-600' : 'text-slate-800'}`}>
                {insights.lossPercentage.toFixed(1)}%
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1">
                <AlertTriangle size={12} className={insights.lossPercentage > 10 ? 'text-red-500' : 'text-slate-400'} />
                {fmtKg(insights.totalLoss)} kg perdidos
              </p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${insights.lossPercentage > 10 ? 'bg-red-100' : 'bg-red-50'}`}>
              <AlertTriangle size={22} className={insights.lossPercentage > 10 ? 'text-red-600' : 'text-red-400'} />
            </div>
          </div>
          {insights.lossPercentage > 10 && (
            <div className="mt-3 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-lg flex items-center gap-1">
              <ArrowUpRight size={10} /> Acima do aceitável (10%). Revisar beneficiamento.
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 2: Pipeline de Status + Volume por Produto */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Fluxo de Cargas */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2">
            <Activity size={18} style={{ color: 'var(--primary-color)' }} /> Fluxo de Cargas
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Em Trânsito', count: insights.pipeline.coletado, color: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-700', icon: Truck },
              { label: 'Beneficiado', count: insights.pipeline.beneficiado, color: 'bg-violet-500', lightBg: 'bg-violet-50', textColor: 'text-violet-700', icon: Factory },
              { label: 'A Pagar', count: insights.pipeline.pagamento_programado, color: 'bg-amber-500', lightBg: 'bg-amber-50', textColor: 'text-amber-700', icon: Clock },
              { label: 'Finalizadas', count: insights.pipeline.pago, color: 'bg-emerald-500', lightBg: 'bg-emerald-50', textColor: 'text-emerald-700', icon: CheckCircle2 },
            ].map(stage => {
              const total = insights.totalLoads || 1;
              const pct = (stage.count / total) * 100;
              const Icon = stage.icon;
              return (
                <div key={stage.label} className={`${stage.lightBg} rounded-xl p-3 flex items-center gap-3`}>
                  <div className={`w-9 h-9 rounded-lg ${stage.color} text-white flex items-center justify-center shrink-0`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`text-xs font-bold ${stage.textColor}`}>{stage.label}</span>
                      <span className="text-xs font-black text-slate-700">{stage.count}</span>
                    </div>
                    <div className="w-full h-2 bg-white/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stage.color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Link to={`/${companySlug}/app/operacao`} className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 transition">
            Ver todas as cargas <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Volume por Produto (Gráfico de Barras Horizontal) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2">
            <BarChart3 size={18} style={{ color: 'var(--primary-color)' }} /> Volume por Produto
          </h3>
          {insights.topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Leaf size={32} className="mb-2 opacity-40" />
              <p className="text-sm font-medium">Nenhuma carga registrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.topProducts.map(([name, volume], idx) => {
                const pct = (volume / insights.maxProductVolume) * 100;
                const colors = [
                  { bar: 'var(--primary-color)', bg: 'color-mix(in srgb, var(--primary-color), white 88%)' },
                  { bar: '#6366f1', bg: '#eef2ff' },
                  { bar: '#f59e0b', bg: '#fffbeb' },
                  { bar: '#06b6d4', bg: '#ecfeff' },
                  { bar: '#ec4899', bg: '#fdf2f8' },
                ];
                const c = colors[idx % colors.length];
                return (
                  <div key={name}>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-sm font-bold text-slate-700">{name}</span>
                      <span className="text-xs font-black text-slate-500">{fmtKg(volume)} kg</span>
                    </div>
                    <div className="w-full h-7 rounded-lg overflow-hidden" style={{ backgroundColor: c.bg }}>
                      <div
                        className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: c.bar }}
                      >
                        {pct > 15 && <span className="text-[10px] font-black text-white/90">{pct.toFixed(0)}%</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 3: Desempenho por Unidade */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <BarChart3 size={18} style={{ color: 'var(--primary-color)' }} /> Desempenho por Unidade
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-1">
                Filtros apenas nesta seção
              </span>
              {unitFiltersActive && (
                <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand-soft rounded-full px-2 py-1">
                  Filtro ativo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Unidades inativas permanecem no histórico; cargas antigas entram pelo fallback legado por produtor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[minmax(160px,1fr)_minmax(180px,1fr)_auto] gap-2 w-full lg:w-auto">
            <select
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand/20"
              value={unitProducerFilter}
              onChange={event => {
                setUnitProducerFilter(event.target.value);
                setUnitFilter('all');
              }}
              aria-label="Filtrar por produtor"
            >
              <option value="all">Todos os produtores</option>
              {companyProducers.map(producer => (
                <option key={producer.id} value={producer.id}>{producer.name}</option>
              ))}
            </select>

            <select
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand/20"
              value={unitFilter}
              onChange={event => setUnitFilter(event.target.value)}
              aria-label="Filtrar por unidade"
            >
              <option value="all">Todas as unidades</option>
              {unitFilterOptions.map(row => (
                <option key={row.key} value={row.key}>
                  {row.unitName}{row.isLegacy ? ' (legado)' : row.isInactive ? ' (inativa)' : ''}
                </option>
              ))}
            </select>

            {unitFiltersActive && (
              <button
                type="button"
                onClick={() => {
                  setUnitProducerFilter('all');
                  setUnitFilter('all');
                }}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-black text-slate-500 hover:text-slate-800 hover:border-slate-300 transition"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Maior volume</p>
            <h4 className="text-lg font-black text-slate-800">{fmtKg(unitPerformanceHighlights.byVolume?.grossWeight || 0)} kg</h4>
            <p className="text-[11px] font-bold text-slate-500 truncate mt-1">{unitPerformanceHighlights.byVolume?.unitName || 'Sem dados'}</p>
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Maior quebra</p>
            <h4 className="text-lg font-black text-red-600">{(unitPerformanceHighlights.byLoss?.lossPercentage || 0).toFixed(1)}%</h4>
            <p className="text-[11px] font-bold text-red-500/80 truncate mt-1">{unitPerformanceHighlights.byLoss?.unitName || 'Sem dados'}</p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Maior valor financeiro</p>
            <h4 className="text-lg font-black text-emerald-700">{fmt(unitPerformanceHighlights.byFinancial?.financialValue || 0)}</h4>
            <p className="text-[11px] font-bold text-emerald-600/80 truncate mt-1">{unitPerformanceHighlights.byFinancial?.unitName || 'Sem dados'}</p>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/80 p-4">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Sem unidade vinculada</p>
            <h4 className="text-lg font-black text-amber-700">{unitPerformanceHighlights.legacyLoadCount}</h4>
            <p className="text-[11px] font-bold text-amber-600/80 truncate mt-1">cargas no fallback legado</p>
          </div>
        </div>

        {filteredUnitPerformance.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/60">
            <BarChart3 size={30} className="mb-2 opacity-50" />
            <p className="text-sm font-bold">Nenhuma unidade encontrada para os filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[190px]">Unidade</th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[150px]">Produtor</th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cargas</th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Volume bruto</th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Peso líquido</th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Quebra %</th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor financeiro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUnitPerformance.map(row => (
                  <tr key={row.key} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-black text-slate-800 truncate">{row.unitName}</span>
                        {row.isInactive && <span className="shrink-0 text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">Inativa</span>}
                        {row.isLegacy && <span className="shrink-0 text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">Legado</span>}
                        {row.isSnapshot && <span className="shrink-0 text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 rounded px-1.5 py-0.5">Snapshot</span>}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="text-sm font-bold text-slate-600 truncate block">{row.producerName}</span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="text-sm font-black text-slate-700">{row.loadCount}</span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="text-sm font-black text-slate-700">{fmtKg(row.grossWeight)} kg</span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="text-sm font-bold text-slate-600">{fmtKg(row.netWeight)} kg</span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className={`text-xs font-black px-2 py-1 rounded-lg ${row.lossPercentage > 10 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        {row.lossPercentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="text-sm font-black text-slate-700 block">{fmt(row.financialValue)}</span>
                      <span className="text-[10px] font-bold text-slate-400">
                        R$ {row.avgPricePerKg.toFixed(2)}/kg{row.pendingPayment > 0 ? ` - a pagar ${fmt(row.pendingPayment)}` : ''}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* ROW 4: Ranking de Produtores + Atalhos Rápidos */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Ranking de Produtores */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2">
            <Users size={18} style={{ color: 'var(--primary-color)' }} /> Ranking de Produtores
          </h3>
          {insights.topProducers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <UsersRound size={32} className="mb-2 opacity-40" />
              <p className="text-sm font-medium">Nenhum produtor com cargas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-8">#</th>
                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produtor</th>
                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Volume (kg)</th>
                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cargas</th>
                    <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Média/Carga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {insights.topProducers.map((prod, idx) => {
                    const avgPerLoad = prod.loads > 0 ? prod.weight / prod.loads : 0;
                    const medals = ['🥇', '🥈', '🥉'];
                    return (
                      <tr key={prod.name} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 text-sm">
                          {idx < 3 ? <span className="text-lg">{medals[idx]}</span> : <span className="text-xs font-bold text-slate-400">{idx + 1}</span>}
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: 'var(--primary-color)' }}
                            >
                              {prod.name.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{prod.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-right">
                          <span className="text-sm font-black text-slate-700">{fmtKg(prod.weight)}</span>
                        </td>
                        <td className="py-3.5 text-right">
                          <span className="text-sm font-bold text-slate-500">{prod.loads}</span>
                        </td>
                        <td className="py-3.5 text-right">
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{fmtKg(avgPerLoad)} kg</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <Link to={`/${companySlug}/app/produtores`} className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 transition">
            Gerenciar Produtores <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Quick Action Shortcuts */}
        <div>
          <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-amber-500 fill-amber-500" /> Acesso Rápido
          </h3>
          <div className="space-y-3">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <Link 
                  key={shortcut.path} 
                  to={shortcut.path}
                  className={`flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${shortcut.hover} group`}
                >
                  <div className={`w-12 h-12 rounded-xl ${shortcut.bg} ${shortcut.color} flex items-center justify-center shrink-0 group-active:scale-95 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 leading-tight">
                    {shortcut.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Resumo Financeiro Mini */}
          <div className="mt-4 bg-slate-900 rounded-2xl p-5 text-white">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Resumo Financeiro</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Total Pago</span>
                <span className="text-sm font-black text-emerald-400">{fmt(insights.totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">A Pagar</span>
                <span className="text-sm font-black text-amber-400">{fmt(insights.pendingPayment)}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-xs text-slate-300 font-bold">Peso Líquido Total</span>
                <span className="text-sm font-black text-white">{fmtKg(insights.totalNetWeight)} kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
