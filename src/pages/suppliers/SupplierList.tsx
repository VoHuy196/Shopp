import { useEffect, useState } from 'react';
import { SupplierService } from '@/services';
import type { Supplier } from '@/types';
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Label } from '@/components/ui';
import { Plus, ChevronDown, MapPin, Phone, Mail, Edit2, Trash2, User, Globe, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SupplierList = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await SupplierService.getAll();
            setSuppliers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
            await SupplierService.delete(id);
            loadData();
        }
    };

    const handleEditClick = (supplier: Supplier) => {
        setEditingSupplier({...supplier});
        setIsEditDialogOpen(true);
    };
    const handleUpdate = async () => {
        if (!editingSupplier || !editingSupplier.name.trim()) return;
        setSaving(true);
        try {
            await SupplierService.update(editingSupplier.id, {
                name: editingSupplier.name,
                code: editingSupplier.code,
                contactPerson: editingSupplier.contactPerson,
                phone: editingSupplier.phone,
                email: editingSupplier.email,
                address: editingSupplier.address,
            });
            setIsEditDialogOpen(false);
            setEditingSupplier(null);
            loadData(); 
        } catch (error) {
            console.error(error);
            alert("Lỗi khi cập nhật nhà cung cấp!");
        } finally {
            setSaving(false);
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.includes(searchTerm) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-[400px] items-center justify-center">
            <div className="text-muted-foreground animate-pulse text-lg">Đang tải dữ liệu...</div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Nhà Cung Cấp</h2>
                    <p className="text-muted-foreground text-sm">Quản lý thông tin liên hệ và lịch sử giao dịch với nhà cung cấp.</p>
                </div>

                <Link to="new">
                    <Button className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold tracking-tight px-4 h-9 text-xs shadow-lg shadow-indigo-200">
                        <Plus className="mr-2 h-4 w-4" /> THÊM NHÀ CUNG CẤP
                    </Button>
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 h-9 cursor-pointer hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-semibold text-slate-600">Filter</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex-1 max-w-sm">
                    <Input
                        placeholder="Search name, code, phone..."
                        className="h-9 shadow-none border-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="ghost" className="text-slate-500 font-medium" onClick={() => setSearchTerm('')}>Reset</Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs w-[30%] pb-6">Supplier Info</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs w-[30%] pb-6">Contact Details</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs pb-6">Location</th>
                            <th className="p-4 w-10 pb-6"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredSuppliers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-muted-foreground italic bg-slate-50/20">
                                    Không tìm thấy nhà cung cấp nào.
                                </td>
                            </tr>
                        )}
                        {filteredSuppliers.map((supplier) => (
                            <tr key={supplier.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 align-top">
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0">
                                            <Globe className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="font-bold text-slate-700 text-sm">{supplier.name}</div>
                                            <div className="text-slate-400 text-xs font-mono">{supplier.code}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <User className="h-3 w-3 text-slate-400" />
                                            <span className="font-medium">{supplier.contactPerson || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Phone className="h-3 w-3 text-slate-400" />
                                            <span>{supplier.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Mail className="h-3 w-3 text-slate-400" />
                                            <span>{supplier.email || 'N/A'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="flex items-start gap-2 max-w-xs">
                                        <MapPin className="h-3 w-3 text-slate-400 mt-0.5" />
                                        <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                                            {supplier.address || 'No address registered.'}
                                        </p>
                                    </div>
                                </td>
                                <td className="p-4 align-top text-right">
                                    <div className="flex items-center justify-end gap-1 px-4">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-amber-500 text-white rounded-md hover:bg-amber-600 shadow-sm transition-all" onClick={() => handleEditClick(supplier)}>
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm transition-all" onClick={() => handleDelete(supplier.id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* --- Edit Modal --- */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Cập nhật Nhà Cung Cấp</DialogTitle>
                    </DialogHeader>
                    {editingSupplier && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Tên nhà cung cấp *</Label>
                                    <Input
                                        id="edit-name"
                                        value={editingSupplier.name}
                                        onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-code">Mã NCC</Label>
                                    <Input
                                        id="edit-code"
                                        value={editingSupplier.code}
                                        onChange={(e) => setEditingSupplier({ ...editingSupplier, code: e.target.value })}
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-contact">Người liên hệ</Label>
                                    <Input
                                        id="edit-contact"
                                        value={editingSupplier.contactPerson || ''}
                                        onChange={(e) => setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-phone">Số điện thoại</Label>
                                    <Input
                                        id="edit-phone"
                                        value={editingSupplier.phone || ''}
                                        onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editingSupplier.email || ''}
                                    onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-address">Địa chỉ</Label>
                                <Input
                                    id="edit-address"
                                    value={editingSupplier.address || ''}
                                    onChange={(e) => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={handleUpdate}
                            disabled={saving || !editingSupplier?.name}
                        >
                            {saving ? 'Đang lưu...' : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        
        
    );
};
