import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores';

export const ProtectedRoute = () => {
    const { isAuthenticated, user } = useAuthStore();

    // Nếu chưa đăng nhập -> Chuyển về trang Login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Nếu đăng nhập nhưng không phải admin -> Chuyển về trang chủ
    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // Nếu đã đăng nhập và là admin -> Cho phép hiển thị nội dung bên trong (Outlet)
    return <Outlet />;
};