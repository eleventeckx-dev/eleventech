import { Navigate, useParams } from 'react-router-dom';
import { useAgro } from '../../contexts/AgroContext';

const UserIndexRedirect = () => {
  const { currentUser } = useAgro();
  const { companySlug } = useParams<{ companySlug: string }>();

  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.permissions?.canCollect) return <Navigate to={`/${companySlug}/user/coleta`} replace />;
  if (currentUser.permissions?.canProcess) return <Navigate to={`/${companySlug}/user/beneficiamento`} replace />;
  return <Navigate to={`/${companySlug}/user/coleta`} replace />;
};

export default UserIndexRedirect;
