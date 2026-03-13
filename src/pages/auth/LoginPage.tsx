import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Lock, User as UserIcon } from 'lucide-react';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isAuthenticated, user } = useAuth(); // Lấy thêm user từ context
    const navigate = useNavigate();

    // Nếu đã đăng nhập rồi mà vào lại trang login, tự động redirect đúng role
    if (isAuthenticated && user) {
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); 

        // Gọi hàm login mới (trả về User object hoặc null)
        const loggedUser = await login(username, password);

        if (loggedUser) {
            // --- LOGIC CHUYỂN HƯỚNG THEO ROLE ---
            if (loggedUser.role === 'admin') {
                navigate('/admin'); // Admin -> Trang quản lý
            } else {
                navigate('/');      // User -> Trang bán hàng
            }
        } else {
            setError('Sai tài khoản hoặc mật khẩu!');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <Card className="w-full max-w-[400px] shadow-lg">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-indigo-100 p-3 rounded-full w-fit">
                        <Lock className="h-6 w-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-xl">Đăng nhập hệ thống</CardTitle>
                </CardHeader>
                <CardContent>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2 relative">
                            <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Tên đăng nhập" 
                                className="pl-9"
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                            />
                        </div>
                        <div className="space-y-2 relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input 
                                type="password" 
                                placeholder="Mật khẩu" 
                                className="pl-9"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 text-center font-medium bg-red-50 p-2 rounded">{error}</p>}
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                            Đăng nhập
                        </Button>
                        <div className="text-center text-sm mt-2">
                            <Link to="/register" className="text-indigo-600 hover:underline">Chưa có tài khoản? Đăng ký</Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};