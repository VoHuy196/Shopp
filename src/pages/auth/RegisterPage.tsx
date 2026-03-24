import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '@/services';
import { useAuthStore } from '@/stores';

import { Button, Input, Card, CardHeader, CardTitle, CardContent, Label } from '@/components/ui';

export const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Role is assigned by admin; new registrations default to 'customer'
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!username.trim() || !email.trim() || !password.trim()) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setSaving(true);
        try {
            await UserService.create({ username: username.trim(), email: email.trim(), password, role: 'customer' });
            // Auto-login after register
            const logged = await login(username.trim(), password);
            if (logged) {
                navigate('/');
            } else {
                navigate('/login');
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi khi đăng ký');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-xl">Đăng ký tài khoản</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reg-username">Tên đăng nhập</Label>
                            <Input id="reg-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên đăng nhập" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reg-email">Email</Label>
                            <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reg-password">Mật khẩu</Label>
                            <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" />
                        </div>

                        {/* Role selection removed: admin assigns roles in User Management */}

                        {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white w-full" disabled={saving}>
                                {saving ? 'Đang đăng ký...' : 'Đăng ký'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
