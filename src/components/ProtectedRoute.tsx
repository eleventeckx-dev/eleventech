import { Navigate, Outlet } from 'react-router-dom';
import { useAgro } from '../contexts/AgroContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { currentUser, isLoading } = useAgro();

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

  return <Outlet />;
};

export default ProtectedRoute;
