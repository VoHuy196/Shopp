import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductService, InventoryService, CategoryService } from '@/services';
import type { Product, Category, AdjustmentReason } from '@/types';
import { Button, Input, Label } from '@/components/ui';
import { ArrowLeft, Save, Filter } from 'lucide-react';

interface StockTakeItem {
    productId: string;
    variantId: string;
    sku: string;
    productName: string;
    systemQuantity: number;
    actualQuantity: number;
    difference: number;
}

export const StockTakeForm = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<StockTakeItem[]>([]);
    const [reason, setReason] = useState<AdjustmentReason>('STOCK_TAKE');
    const [note, setNote] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadMetaData = async () => {
            const [prodData, catData] = await Promise.all([
                ProductService.getAll(),
                CategoryService.getAll()
            ]);
            setProducts(prodData);
            setCategories(catData);

            // Initial Load: Flatten products to items
            generateItems(prodData, '');
        };
        loadMetaData();
    }, []);

    const generateItems = (productList: Product[], categoryId: string) => {
        let newItems: StockTakeItem[] = [];
        const filtered = categoryId ? productList.filter(p => p.categoryId === categoryId) : productList;

        filtered.forEach(p => {
            p.variants.forEach(v => {
                newItems.push({
                    productId: p.id,
                    variantId: v.id,
                    sku: v.sku,
                    productName: `${p.name} ${p.hasVariant ? '' : ''}`,
                    systemQuantity: v.quantity,
                    actualQuantity: v.quantity, // Default to system quantity
                    difference: 0
                });
            });
        });
        setItems(newItems);
    };

    const handleCategoryChange = (catId: string) => {
        setSelectedCategory(catId);
        generateItems(products, catId);
    };

    const handleActualChange = (index: number, val: number) => {
        const newItems = [...items];
        const item = newItems[index];
        item.actualQuantity = val;
        item.difference = val - item.systemQuantity;
        setItems(newItems);
    };

    const handleSubmit = async () => {
        // Only save items that have difference OR save all? Usually Stock Take saves snapshot.
        // Let's save all for history record, but only those in the list.

        if (!confirm('Xác nhận hoàn tất kiểm kê? Số lượng tồn kho sẽ được cập nhật theo số Thực tế.')) return;

        setSubmitting(true);
        try {
            await InventoryService.create({
                reason,
                note,
                items: items.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    sku: item.sku,
                    productName: item.productName,
                    systemQuantity: item.systemQuantity,
                    actualQuantity: item.actualQuantity
                }))
            });
            navigate('..');
        } catch (error) {
            console.error(error);
            alert('Lỗi khi lưu phiếu kiểm kê');
        } finally {
            setSubmitting(false);
        }
    };

    const totalDiff = items.reduce((sum, item) => sum + Math.abs(item.difference), 0);
    const hasDiff = items.some(i => i.difference !== 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('..')} className="rounded-full shadow-sm text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h2 className="text-lg font-semibold tracking-tight">Phiếu Kiểm Kê Kho</h2>
                    <p className="text-sm text-muted-foreground">Nhập số lượng thực tế để điều chỉnh tồn kho.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSubmit} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-6 shadow-lg shadow-indigo-200">
                        <Save className="mr-2 h-4 w-4" /> Hoàn tất & Cập nhật kho
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Controls */}
                <div className="md:col-span-1 space-y-4">
                    <div className="p-4 border rounded-lg bg-card space-y-4">
                        <div className="grid gap-2">
                            <Label>Lý do</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={reason}
                                onChange={(e) => setReason(e.target.value as any)}
                            >
                                <option value="STOCK_TAKE">Kiểm kê định kỳ</option>
                                <option value="DAMAGED">Hàng hỏng/vỡ</option>
                                <option value="EXPIRED">Hết hạn sử dụng</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Ghi chú</Label>
                            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: Kiểm kê quý 1..." />
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                        <Label className="flex items-center gap-2"><Filter className="h-4 w-4" /> Lọc sản phẩm</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                            <option value="">-- Tất cả danh mục --</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <div className="text-sm text-muted-foreground pt-2">
                            Hiển thị: <b>{items.length}</b> biến thể
                        </div>
                    </div>

                    {hasDiff && (
                        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
                            <b>Phát hiện chênh lệch!</b><br />
                            Tổng lệch: {totalDiff} đơn vị.
                            <br />Hãy kiểm tra kỹ trước khi Lưu.
                        </div>
                    )}
                </div>

                {/* Main Table */}
                <div className="md:col-span-3 border rounded-lg bg-card overflow-hidden">
                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 text-left">SKU</th>
                                    <th className="p-3 text-left">Sản phẩm</th>
                                    <th className="p-3 text-right bg-blue-50/50 w-32">Tồn hệ thống</th>
                                    <th className="p-3 text-right bg-green-50/50 w-32">Thực tế</th>
                                    <th className="p-3 text-right w-24">Lệch</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((item, index) => (
                                    <tr key={item.variantId} className={item.difference !== 0 ? 'bg-yellow-50/30' : ''}>
                                        <td className="p-3 font-mono">{item.sku}</td>
                                        <td className="p-3 line-clamp-1">{item.productName}</td>
                                        <td className="p-3 text-right font-medium">{item.systemQuantity}</td>
                                        <td className="p-3 text-right">
                                            <Input
                                                type="number"
                                                className={`h-8 w-24 text-right ml-auto ${item.difference !== 0 ? 'border-yellow-500 ring-yellow-500' : ''}`}
                                                value={item.actualQuantity}
                                                onChange={(e) => handleActualChange(index, Number(e.target.value))}
                                                onFocus={(e) => e.target.select()}
                                            />
                                        </td>
                                        <td className={`p-3 text-right font-bold ${item.difference > 0 ? 'text-green-600' : item.difference < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                            {item.difference > 0 ? `+${item.difference}` : item.difference}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};


