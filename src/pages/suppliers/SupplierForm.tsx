import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { SupplierService } from '@/services';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateSupplierInput } from '@/types';

export const SupplierForm = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState<CreateSupplierInput>({
        code: '',
        name: '',
        taxCode: '',
        address: '',
        contactPerson: '',
        phone: '',
        email: '',
        note: ''
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Auto generate code if empty? For now require it or generate it.
            // Let's simple generate if empty
            const finalData = {
                ...formData,
                code: formData.code || `SUP${Date.now().toString().slice(-6)}`
            };

            await SupplierService.create(finalData);
            navigate('/suppliers');
        } catch (error) {
            console.error(error);
            alert('Failed to save supplier');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Thêm Nhà Cung Cấp</h2>
                    <p className="text-muted-foreground text-sm">Vui lòng điền thông tin bên dưới để thêm bản ghi mới.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('..')} className="rounded-full shadow-sm text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-8 space-y-8">
                    {/* General Information Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên Nhà Cung Cấp *</Label>
                            <Input id="name" value={formData.name} onChange={handleChange} required placeholder="VD: Công ty TNHH ABC" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Mã Nhà Cung Cấp</Label>
                            <Input id="code" value={formData.code} onChange={handleChange} placeholder="Tự động sinh nếu để trống" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="taxCode">Mã Số Thuế</Label>
                            <Input id="taxCode" value={formData.taxCode} onChange={handleChange} placeholder="VD: 0312345678" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactPerson">Người Liên Hệ</Label>
                            <Input id="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Tên nhân viên sale..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Số Điện Thoại *</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} required placeholder="090..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="sales@example.com" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Địa Chỉ</Label>
                            <Input id="address" value={formData.address} onChange={handleChange} placeholder="Địa chỉ kho/văn phòng" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <div className="space-y-2">
                            <Label htmlFor="note">Ghi Chú</Label>
                            <textarea
                                id="note"
                                className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all resize-none"
                                value={formData.note}
                                onChange={handleChange as any}
                                placeholder="Ghi chú về thanh toán, giao hàng..."
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/50 px-8 py-4 border-t flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => navigate('..')} className="font-medium text-slate-600">
                        Hủy bỏ
                    </Button>
                    <Button type="submit" disabled={submitting} className="px-8 shadow-sm shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700">
                        {submitting ? 'Đang lưu...' : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Lưu thông tin
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}


