import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCartStore, useCartCount, useCartTotal } from '@/stores';
import { useAuthStore } from '@/stores';

export const ShopLayout = () => {
    const cartCount = useCartCount();
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header Khách hàng */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 hover:opacity-80 transition-opacity">
                        <Store className="h-6 w-6" />
                        <span>MY STORE</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <Link to="/" className="hover:text-indigo-600 transition-colors">Trang chủ</Link>
                        <Link to="/shop/all" className="hover:text-indigo-600 transition-colors">Sản phẩm</Link>
                        <Link to="/shop/promotions" className="hover:text-indigo-600 transition-colors">Khuyến mãi</Link>
                        <Link to="#" className="hover:text-indigo-600 transition-colors">Liên hệ</Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {!isAuthenticated ? (
                            <Link to="/login">
                                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-indigo-600">
                                    <User className="h-4 w-4 mr-2" /> Login
                                </Button>
                            </Link>
                        ) : user?.role === 'admin' ? (
                            <Link to="/admin">
                                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-indigo-600">
                                    <User className="h-4 w-4 mr-2" /> Admin
                                </Button>
                            </Link>
                        ) : (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-slate-500 hover:text-indigo-600"
                                onClick={() => {
                                    logout();
                                    navigate('/');
                                }}
                            >
                                <LogOut className="h-4 w-4 mr-2" /> Logout
                            </Button>
                        )}
                        
                        <Button variant="outline" onClick={() => navigate('/shop/cart')} className="relative rounded-full border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-700">
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                                    {cartCount}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Nội dung chính */}
            <main className="flex-1 w-full">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
                    <div className="space-y-4">
                        <h3 className="text-white font-bold text-lg">MY STORE</h3>
                        <p>Hệ thống bán lẻ và quản lý kho hàng hiện đại, chuyên nghiệp.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Về chúng tôi</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-white">Câu chuyện thương hiệu</a></li>
                            <li><a href="#" className="hover:text-white">Tuyển dụng</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Hỗ trợ</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-white">Chính sách đổi trả</a></li>
                            <li><a href="#" className="hover:text-white">Hướng dẫn mua hàng</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Liên hệ</h4>
                        <p>Hotline: 1900 1234</p>
                        <p>Email: support@mystore.com</p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-xs">
                    &copy; 2024 My Store System. All rights reserved.
                </div>
            </footer>
        </div>
    );
};