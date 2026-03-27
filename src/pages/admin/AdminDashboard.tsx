import React from 'react';
import { Link } from 'react-router-dom';
import { useAgro } from '../../contexts/AgroContext';
import { 
  Truck, DollarSign, AlertTriangle, TrendingUp, Package, Users, 
  Activity, UsersRound, Settings, Zap 
} from 'lucide-react';

const AdminDashboard = () => {
  const { loads, producers } = useAgro();

  // Stats calculation
  const totalLoads = loads.length;
  const pendingPayment = loads.filter(l => l.status === 'pagamento_programado').reduce((acc, l) => acc + (l.financial?.finalValue || 0), 0);
  const totalPaid = loads.filter(l => l.status === 'pago').reduce((acc, l) => acc + (l.financial?.finalValue || 0), 0);
  const totalLost = loads.reduce((acc, l) => acc + (l.processing ? (l.processing.damage + l.processing.discard) : 0), 0);

  // Atalhos atualizados e coerentes com a nova estrutura de rotas
  const shortcuts = [
    { name: 'Central de Operações', path: '/app/operacao', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'hover:border-emerald-200 hover:shadow-emerald-500/10' },
    { name: 'Gerenciar Usuários', path: '/app/usuarios', icon: UsersRound, color: 'text-blue-600', bg: 'bg-blue-50', hover: 'hover:border-blue-200 hover:shadow-blue-500/10' },
    { name: 'Ajustes do Sistema', path: '/app/configuracoes', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-100', hover: 'hover:border-slate-300 hover:shadow-slate-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total de Cargas</p>
            <h3 className="text-3xl font-bold text-slate-800">{totalLoads}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1"><TrendingUp size={14}/> +12% este mês</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">A Pagar</p>
            <h3 className="text-3xl font-bold text-slate-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingPayment)}
            </h3>
            <p className="text-xs text-amber-600 font-medium mt-2">Programado para esta semana</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Pago</p>
            <h3 className="text-3xl font-bold text-slate-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaid)}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-2">Acumulado do mês</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Perdas / Avarias</p>
            <h3 className="text-3xl font-bold text-slate-800">{totalLost} <span className="text-lg text-slate-500">kg</span></h3>
            <p className="text-xs text-red-500 font-medium mt-2">Atenção no beneficiamento</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Zap size={20} className="text-amber-500 fill-amber-500" /> Acesso Rápido
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <Link 
                key={shortcut.path} 
                to={shortcut.path}
                className={`flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${shortcut.hover} group`}
              >
                <div className={`w-14 h-14 rounded-full ${shortcut.bg} ${shortcut.color} flex items-center justify-center mb-3 group-active:scale-95 transition-transform`}>
                  <Icon size={28} />
                </div>
                <span className="text-base font-bold text-slate-700 text-center leading-tight">
                  {shortcut.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela Resumo Cargas (Apenas Leitura no Dashboard) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
           <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Package size={20} className="text-emerald-600"/> Últimas Cargas Processadas</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-slate-100">
                   <th className="pb-3 text-sm font-semibold text-slate-500">ID</th>
                   <th className="pb-3 text-sm font-semibold text-slate-500">Produtor</th>
                   <th className="pb-3 text-sm font-semibold text-slate-500">Produto</th>
                   <th className="pb-3 text-sm font-semibold text-slate-500">Status</th>
                   <th className="pb-3 text-sm font-semibold text-slate-500">Peso</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {loads.slice(0, 5).map(load => {
                   const statusColors = {
                     coletado: 'bg-blue-50 text-blue-700 border-blue-200',
                     beneficiado: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                     pagamento_programado: 'bg-amber-50 text-amber-700 border-amber-200',
                     pago: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                   };
                   return (
                     <tr key={load.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="py-4 text-sm font-bold text-slate-900">#{load.id.slice(-4)}</td>
                       <td className="py-4 text-sm font-medium text-slate-600">{producers.find(p => p.id === load.producerId)?.name}</td>
                       <td className="py-4 text-sm text-slate-600">{load.collection.type}</td>
                       <td className="py-4">
                         <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize border ${statusColors[load.status]}`}>
                           {load.status.replace('_', ' ')}
                         </span>
                       </td>
                       <td className="py-4 text-sm font-semibold text-slate-700">{load.collection.grossWeight} kg</td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
           </div>
        </div>

        {/* Tabela Resumo Produtores (Apenas Leitura no Dashboard) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
           <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Users size={20} className="text-emerald-600"/> Produtores Ativos</h3>
           <div className="space-y-4">
              {producers.map(prod => (
                <div key={prod.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                    {prod.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-sm">{prod.name}</p>
                    <p className="text-xs text-slate-500">{prod.property}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;