import { useEffect, useState } from 'react';
import { UserService } from '@/services';
import type { User } from '@/types';
import { Button, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui';
import { Trash2, Edit2 } from 'lucide-react';

export const UserManagementPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state for edit
    const [editForm, setEditForm] = useState<{ username: string; email: string; role: 'customer' | 'staff' | 'admin' }>({
        username: '',
        email: '',
        role: 'customer'
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await UserService.getAll();
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setEditForm({
            username: user.username,
            email: user.email,
            role: user.role
        });
        setEditDialogOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!editForm.username.trim() || !editForm.email.trim()) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (!editingUser) return;

        setSaving(true);
        try {
            await UserService.update(editingUser.id, {
                username: editForm.username,
                email: editForm.email,
                role: editForm.role
            });
            setEditDialogOpen(false);
            setEditingUser(null);
            loadUsers();
        } catch (error: any) {
            alert(error.message || 'Lỗi khi cập nhật tài khoản');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
            try {
                await UserService.delete(id);
                loadUsers();
            } catch (error) {
                console.error(error);
                alert('Lỗi khi xóa tài khoản');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="text-muted-foreground animate-pulse text-lg">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Tài khoản</h2>
                    <p className="text-muted-foreground text-sm">Chỉnh sửa hoặc xóa tài khoản người dùng.</p>
                </div>

            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs">Username</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs">Email</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs">Vai trò</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs">Ngày tạo</th>
                            <th className="p-4 w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-muted-foreground italic">
                                    Chưa có tài khoản nào.
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-medium text-slate-700">{user.username}</td>
                                    <td className="p-4 text-slate-600">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                            user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                                            'bg-slate-100 text-slate-800'
                                        }`}>
                                            {user.role === 'admin' ? 'Quản trị' : user.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600 text-xs">
                                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} className="h-8 w-8 bg-amber-500 text-white rounded-md hover:bg-amber-600">
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)} className="h-8 w-8 bg-red-600 text-white rounded-md hover:bg-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create dialog removed — registration is handled publicly via /register */}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-md">

                    <DialogHeader>
                        <DialogTitle>Chỉnh Sửa Tài Khoản</DialogTitle>
                        <DialogDescription>Cập nhật thông tin tài khoản người dùng, bao gồm tên đăng nhập, email và vai trò.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-username">Tên đăng nhập *</Label>
                            <Input
                                id="edit-username"
                                value={editForm.username}
                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                placeholder="VD: john_doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email *</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                placeholder="VD: john@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Vai trò *</Label>
                            <select
                                id="edit-role"
                                title="Vai trò"
                                aria-label="Vai trò"
                                value={editForm.role}
                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="customer">Khách hàng</option>
                                <option value="staff">Nhân viên</option>
                                <option value="admin">Quản trị</option>
                            </select>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Hủy</Button>
                            <Button onClick={handleUpdateUser} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
