import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryService } from '@/services';
import { Button, Input, Label } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';

export const CategoryForm = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [minStockThreshold, setMinStockThreshold] = useState(10);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await CategoryService.create({ name, description, minStockThreshold });
            navigate('/admin/categories');
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/admin/categories')} className="rounded-full shadow-sm text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold tracking-tight">Thêm Nhóm Sản Phẩm</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 border rounded-lg bg-card shadow-sm space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Tên nhóm *</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="VD: Điện tử" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="desc">Mô tả</Label>
                    <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ngắn gọn..." />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="threshold">Mức cảnh báo tồn kho thấp (Low Stock Threshold) *</Label>
                    <div className="flex items-center gap-4">
                        <Input
                            id="threshold"
                            type="number"
                            value={minStockThreshold}
                            onChange={(e) => setMinStockThreshold(Number(e.target.value))}
                            required
                            min={0}
                            className="w-32"
                        />
                        <span className="text-sm text-muted-foreground">Sản phẩm thuộc nhóm này sẽ báo đỏ khi tồn kho dưới mức này.</span>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-8 shadow-lg shadow-indigo-200">
                        <Save className="mr-2 h-4 w-4" /> Lưu nhóm hàng
                    </Button>
                </div>
            </form>
        </div>
    );
};


