import { Navigate } from 'react-router-dom';
import { useAgro } from '../../contexts/AgroContext';

const UserIndexRedirect = () => {
  const { currentUser } = useAgro();
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.permissions?.canCollect) return <Navigate to="/user/coleta" replace />;
  if (currentUser.permissions?.canProcess) return <Navigate to="/user/beneficiamento" replace />;
  return <Navigate to="/user/coleta" replace />;
};

export default UserIndexRedirect;
