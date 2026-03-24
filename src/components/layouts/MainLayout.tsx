import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Users, TrendingUp, Warehouse, FolderKanban, LogOut, UserCog, UserCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/stores';

export const MainLayout = () => {
    const { user, logout } = useAuthStore();
    const location = useLocation();

    const adminMenuItems = [
        { path: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
        { path: '/admin/products', label: 'Sản phẩm', icon: Package },
        { path: '/admin/categories', label: 'Nhóm sản phẩm', icon: TrendingUp },
        { path: '/admin/attributes', label: 'Thuộc tính', icon: Package },
        { path: '/admin/units', label: 'Đơn vị tính', icon: Package },
        { path: '/admin/suppliers', label: 'Nhà cung cấp', icon: Users },
        { path: '/admin/inbound', label: 'Nhập kho', icon: TrendingUp },
        { path: '/admin/outbound', label: 'Xuất kho', icon: TrendingUp },
        { path: '/admin/inventory', label: 'Quản lý kho', icon: Warehouse },
        { path: '/admin/projects', label: 'Dự án', icon: FolderKanban },
        { path: '/admin/projects/members', label: 'Nhân viên', icon: UserCheck },
        { path: '/admin/projects/assignments', label: 'Phân công', icon: Clock },
        { path: '/admin/users', label: 'Tài khoản', icon: UserCog },
    ];

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col sticky top-0 h-screen shadow-lg">
                {/* Logo */}
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-xl font-bold text-indigo-400">WMS Admin</h1>
                    <p className="text-xs text-slate-400 mt-1">Quản lý kho hàng</p>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
                    {adminMenuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                    active
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="border-t border-slate-700 p-4 space-y-3">
                    <div className="px-4">
                        <p className="text-xs text-slate-400">Đăng nhập với</p>
                        <p className="text-sm font-semibold text-slate-100">{user?.username || 'Admin'}</p>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                    <div className="px-8 h-16 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Hệ thống quản lý kho</h2>
                        <div className="text-sm text-slate-600">
                            {new Date().toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
