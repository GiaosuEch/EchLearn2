import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../../stores/authStore';
import { toast } from '../ui/Toast';

export default function AdminGuard() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'khounguyennguyen2012@gmail.com';

  useEffect(() => {
    if (!isAdmin) {
      toast('Yêu cầu quyền Quản trị viên hệ thống (Admin Only). Vui lòng nâng cấp hoặc đăng nhập bằng tài khoản Admin!', 'warning');
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/app/pricing" replace />;
  }

  return <Outlet />;
}
