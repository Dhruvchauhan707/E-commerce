import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../Hooks/useAuth';
import Loader from '../common/Loader';

export default function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user?.role === 'admin' ? <Outlet /> : <Navigate to={user ? '/' : '/login'} replace />;
}
