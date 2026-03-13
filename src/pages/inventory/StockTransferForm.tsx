import { useEffect, useState } from 'react';
import { InventoryService, ProductService } from '@/services';
import { Warehouse } from '@/types/inventory';
import { Product } from '@/types/product';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { ArrowRightLeft, Save, ArrowLeft } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

export const StockTransferForm = () => {
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    
    const [formData, setFormData] = useState({
        fromWarehouseId: '',
        toWarehouseId: '',
        productId: '',
        quantity: 1,
        reason: ''
    });

    useEffect(() => {
        const load = async () => {
            const [whData, prodData] = await Promise.all([
                InventoryService.getWarehouses(),
                ProductService.getAll()
            ]);
            setWarehouses(whData);
            setProducts(prodData);
        };
        load();
    }, []);

    const handleSubmit = async () => {
        if (formData.fromWarehouseId === formData.toWarehouseId) {
            alert("Kho nguồn và kho đích phải khác nhau!");
            return;
        }
        if (!formData.productId || formData.quantity <= 0) {
            alert("Vui lòng kiểm tra lại thông tin sản phẩm và số lượng.");
            return;
        }

        try {
            await InventoryService.transferStock(
                formData.productId,
                formData.fromWarehouseId,
                formData.toWarehouseId,
                Number(formData.quantity),
                formData.reason
            );
            alert("Chuyển kho thành công!");
            navigate(-1); 
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* --- Header có nút Quay lại --- */}
            <div className="flex items-center gap-4">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => navigate(-1)} 
                    className="h-10 w-10 border-slate-200 hover:bg-slate-100"
                    title="Quay lại"
                >
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                </Button>
                
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <ArrowRightLeft className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Chuyển Kho Nội Bộ</h2>
                        <p className="text-sm text-slate-500">Điều chuyển hàng hóa giữa các chi nhánh.</p>
                    </div>
                </div>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-slate-800">Thông tin phiếu chuyển</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-slate-600">Từ Kho (Nguồn)</Label>
                            <Select onValueChange={(v) => setFormData({...formData, fromWarehouseId: v})}>
                                <SelectTrigger><SelectValue placeholder="Chọn kho xuất hàng" /></SelectTrigger>
                                <SelectContent>
                                    {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600">Đến Kho (Đích)</Label>
                            <Select onValueChange={(v) => setFormData({...formData, toWarehouseId: v})}>
                                <SelectTrigger><SelectValue placeholder="Chọn kho nhận hàng" /></SelectTrigger>
                                <SelectContent>
                                    {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-600">Sản phẩm</Label>
                        <Select onValueChange={(v) => setFormData({...formData, productId: v})}>
                            <SelectTrigger><SelectValue placeholder="Chọn sản phẩm cần chuyển" /></SelectTrigger>
                            <SelectContent>
                                {products.map(p => {
                                    const stock = p.variants?.reduce((s, v) => s + (v.quantity || 0), 0) || 0;
                                    return (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name} (Tổng tồn: {stock})
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-slate-600">Số lượng chuyển</Label>
                            <Input 
                                type="number" min={1} 
                                value={formData.quantity}
                                onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                                className="font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600">Lý do</Label>
                            <Input 
                                placeholder="VD: Cân đối tồn kho tháng 10" 
                                value={formData.reason}
                                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => navigate(-1)}>Hủy bỏ</Button>
                        <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 min-w-[150px]">
                            <Save className="mr-2 h-4 w-4" /> Xác nhận chuyển
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};