import React from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Truck, DollarSign, AlertTriangle, TrendingUp, Package, Users } from 'lucide-react';

const AdminDashboard = () => {
  const { loads, producers } = useAgro();

  // Stats calculation
  const totalLoads = loads.length;
  const pendingPayment = loads.filter(l => l.status === 'pagamento_programado').reduce((acc, l) => acc + (l.financial?.finalValue || 0), 0);
  const totalPaid = loads.filter(l => l.status === 'pago').reduce((acc, l) => acc + (l.financial?.finalValue || 0), 0);
  const totalLost = loads.reduce((acc, l) => acc + (l.processing ? (l.processing.damage + l.processing.discard) : 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total de Cargas</p>
            <h3 className="text-3xl font-bold text-gray-800">{totalLoads}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1"><TrendingUp size={14}/> +12% este mês</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">A Pagar</p>
            <h3 className="text-3xl font-bold text-gray-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingPayment)}
            </h3>
            <p className="text-xs text-amber-600 font-medium mt-2">Programado para esta semana</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Pago</p>
            <h3 className="text-3xl font-bold text-gray-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaid)}
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-2">Acumulado do mês</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Perdas / Avarias</p>
            <h3 className="text-3xl font-bold text-gray-800">{totalLost} <span className="text-lg text-gray-500">kg</span></h3>
            <p className="text-xs text-red-500 font-medium mt-2">Atenção no beneficiamento</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Loads Chart/List Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
           <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><Package size={20} className="text-emerald-600"/> Últimas Cargas Processadas</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-gray-100">
                   <th className="pb-3 text-sm font-medium text-gray-500">ID</th>
                   <th className="pb-3 text-sm font-medium text-gray-500">Produtor</th>
                   <th className="pb-3 text-sm font-medium text-gray-500">Produto</th>
                   <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
                   <th className="pb-3 text-sm font-medium text-gray-500">Peso</th>
                 </tr>
               </thead>
               <tbody>
                 {loads.slice(0, 5).map(load => {
                   const statusColors = {
                     coletado: 'bg-blue-100 text-blue-700',
                     beneficiado: 'bg-indigo-100 text-indigo-700',
                     pagamento_programado: 'bg-amber-100 text-amber-700',
                     pago: 'bg-emerald-100 text-emerald-700',
                   };
                   return (
                     <tr key={load.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                       <td className="py-4 text-sm font-medium text-gray-900">#{load.id.slice(-4)}</td>
                       <td className="py-4 text-sm text-gray-600">{producers.find(p => p.id === load.producerId)?.name}</td>
                       <td className="py-4 text-sm text-gray-600">{load.collection.type}</td>
                       <td className="py-4">
                         <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[load.status]}`}>
                           {load.status.replace('_', ' ')}
                         </span>
                       </td>
                       <td className="py-4 text-sm font-semibold text-gray-700">{load.collection.grossWeight} kg</td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
           </div>
        </div>

        {/* Top Producers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
           <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><Users size={20} className="text-emerald-600"/> Produtores Ativos</h3>
           <div className="space-y-4">
              {producers.map(prod => (
                <div key={prod.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                    {prod.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{prod.name}</p>
                    <p className="text-xs text-gray-500">{prod.property}</p>
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