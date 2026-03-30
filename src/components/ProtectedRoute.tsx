import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAgro } from '../contexts/AgroContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { currentUser, isLoading, companies } = useAgro();
  const { companySlug } = useParams<{ companySlug: string }>();

  // 1. Enquanto o Supabase está validando a sessão, não redirecionamos
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // 2. Se não houver usuário após o carregamento, vai para o Login
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // 3. Se o usuário não tiver a permissão necessária
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  // 4. Se a rota possuir parametro de empresa (Multitenant), validamos a integridade corporativa
  if (companySlug && currentUser.role !== 'maestro') {
    const userCompany = companies.find(c => c.id === currentUser.companyId);
    
    // Se ainda não achou a empresa (provavelmente ainda extraindo dados), segurar a tela.
    if (!userCompany) {
      if (companies.length === 0) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        );
      }
      // Se acabou de carregar companies e ele não pertence a nenhuma, manda pro root
      return <Navigate to="/" replace />;
    }

    // Se a empresa dele não for a que está tentando acessar: Bloqueio + Redirecionamento
    if (userCompany.slug !== companySlug) {
      console.warn(`Acesso negado: Tentou acessar /${companySlug} mas pertence a /${userCompany.slug}`);
      if (currentUser.role === 'admin') return <Navigate to={`/${userCompany.slug}/app/dashboard`} replace />;
      if (currentUser.role === 'collaborator') return <Navigate to={`/${userCompany.slug}/user`} replace />;
      if (currentUser.role === 'producer') return <Navigate to={`/${userCompany.slug}/producer`} replace />;
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
