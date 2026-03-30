import React from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Truck, Factory, User, Leaf, LogOut } from 'lucide-react';
import { useAgro } from '../contexts/AgroContext';

const UserLayout = () => {
  const { currentUser, companies, logout } = useAgro();
  const location = useLocation();
  const navigate = useNavigate();
  const { companySlug } = useParams<{ companySlug: string }>();
  const company = companies.find(c => c.id === currentUser?.companyId);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menu = [
    { name: 'Coleta', path: `/${companySlug}/user/coleta`, icon: Truck },
    { name: 'Benefic.', path: `/${companySlug}/user/beneficiamento`, icon: Factory },
    { name: 'Perfil', path: `/${companySlug}/user/perfil`, icon: User },
  ];

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans"
      style={{ isolation: 'isolate' } as any}
    >
      
      {/* Mobile App Header - Premium Glassmorphism */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] transition-all">
        <div className="max-w-md mx-auto w-full flex items-center justify-between px-6 h-20">
          <div className="flex items-center gap-3">
            <Link to={`/${companySlug}/user/perfil`} className="flex items-center gap-3 group">
              <div className="flex items-center gap-2 font-black text-slate-800 text-lg">
                {company?.logo ? (
                  <img src={company.logo} alt="Eleven Tech" className="h-8 object-contain" />
                ) : (
                  "Eleven Tech"
                )}
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleLogout}
              title="Sair da conta"
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all"
            >
              <LogOut size={20} strokeWidth={2.5} />
            </button>
            <div className="relative group cursor-pointer">
              <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 border-2 border-white shadow-sm transition-transform active:scale-95 overflow-hidden">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  currentUser?.name.charAt(0) || '?'
                )}
              </div>
              <div 
                className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full shadow-sm"
                style={{ backgroundColor: 'var(--primary-color)' }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto relative flex flex-col">
        <div className="flex-1 overflow-y-auto pb-32 pt-4 px-2">
          <Outlet />
        </div>
        
        {/* Floating Bottom Navigation (Premium Pill) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[400px] z-40">
          <div className="bg-white/90 backdrop-blur-2xl border border-white/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-3xl flex justify-around items-center h-20 px-2">
            {menu.map((item) => {
               const Icon = item.icon;
               const isActive = location.pathname.includes(item.path);
               return (
                 <Link 
                   key={item.path} 
                   to={item.path} 
                   className="flex flex-col items-center justify-center w-16 h-full gap-1.5 transition-all group relative"
                 >
                   <div 
                     className={`relative p-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'text-white shadow-md scale-110 -translate-y-1' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                     style={isActive ? { background: 'var(--gradient-bg)', boxShadow: '0 8px 20px -6px var(--primary-color)' } : {}}
                   >
                     <Icon size={22} className={isActive ? 'fill-white/20' : ''} strokeWidth={isActive ? 2.5 : 2} />
                   </div>
                   <span 
                     className={`text-[10px] font-bold truncate w-full text-center transition-colors duration-300 ${isActive ? 'opacity-100' : 'text-slate-400 opacity-80'}`}
                     style={isActive ? { color: 'var(--primary-color)' } : {}}
                   >
                     {item.name}
                   </span>
                 </Link>
               )
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserLayout;