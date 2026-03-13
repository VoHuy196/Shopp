import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InboundService, SupplierService, UnitGroupService, ProductService } from '@/services';
import type { Supplier, Product, ProductVariant, Unit } from '@/types';
import { ProductSelectorDialog } from '@/components/common/ProductSelectorDialog';
import { Button, Input, Label } from '@/components/ui';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

interface OrderItemRow {
    productId: string;
    variantId: string;
    productName: string;
    sku: string;
    unitPrice: number;
    requestQuantity: number;
    receivedQuantity: number;
    unitId?: string;
    unitName?: string;
    conversionRate?: number;
}

export const InboundForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    // Data Sources
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    // Form State
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [note, setNote] = useState('');
    const [items, setItems] = useState<OrderItemRow[]>([]);
    const [productUnits, setProductUnits] = useState<Record<string, Unit[]>>({});

    // New Fields
    const [inboundDate, setInboundDate] = useState(new Date().toISOString().split('T')[0]);
    const [performer, setPerformer] = useState('Admin');

    // Product Selection Dialog/State
    const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

    useEffect(() => {
        const loadInitData = async () => {
            const [supData] = await Promise.all([
                SupplierService.getAll(),
            ]);
            setSuppliers(supData);
        };
        loadInitData();
    }, []);

    useEffect(() => {
        if (isEdit && id) loadOrder(id);
    }, [id, isEdit]);

    const loadOrder = async (orderId: string) => {
        try {
            const order = await InboundService.getById(orderId);
            if (order) {
                setSelectedSupplierId(order.supplierId);
                setNote(order.note || '');
                setInboundDate(order.receivedDate || new Date().toISOString().split('T')[0]);
                setPerformer(order.createdBy || 'Admin');

                // Fetch units/stock info for each item
                const itemsWithUnits = await Promise.all(order.items.map(async (item) => {
                    let maxQty = 999;
                    try {
                        const product = await ProductService.getById(item.productId);
                        if (product?.variants) {
                            const variant = product.variants.find(v => v.id === item.variantId);
                            if (variant) maxQty = variant.quantity || 999;
                        }
                    } catch (e) {
                        console.warn('Failed to fetch variant:', e);
                    }
                    return {
                        productId: item.productId,
                        variantId: item.variantId,
                        productName: item.productName,
                        sku: item.sku,
                        unitPrice: item.unitPrice,
                        requestQuantity: item.requestQuantity,
                        receivedQuantity: item.receivedQuantity,
                        unitId: item.unitId,
                        unitName: item.unitName,
                        conversionRate: item.conversionRate,
                        maxQuantity: maxQty
                    };
                }));
                setItems(itemsWithUnits as any);
            }
        } catch (e) {
            console.error('Failed to load inbound order', e);
            alert('Không tìm thấy phiếu nhập');
            navigate('..');
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (product: Product, variant: ProductVariant) => {
        // Fetch Units if needed
        let units = productUnits[product.id];
        if (product.unitGroupId && !units) {
            units = await UnitGroupService.getByGroupId(product.unitGroupId);
            setProductUnits(prev => ({ ...prev, [product.id]: units }));
        }

        // Determine default Unit (Base Unit)
        let defaultUnitId = undefined;
        let defaultUnitName = undefined;
        let defaultRate = 1;

        if (units && units.length > 0) {
            const base = units.find(u => u.isBaseUnit) || units[0];
            defaultUnitId = base.id;
            defaultUnitName = base.name;
            defaultRate = base.conversionRate;
        }

        const newItem: OrderItemRow = {
            productId: product.id,
            variantId: variant.id,
            productName: `${product.name} (${variant.sku})`,
            sku: variant.sku,
            unitPrice: variant.price || 0,
            requestQuantity: 1,
            receivedQuantity: 1,
            unitId: defaultUnitId,
            unitName: defaultUnitName,
            conversionRate: defaultRate
        };
        setItems([...items, newItem]);
        setIsProductSelectorOpen(false);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: keyof OrderItemRow, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;

        // If Unit changed, update conversion rate and name
        if (field === 'unitId') {
            const item = newItems[index];
            const units = productUnits[item.productId] || [];
            const selectedUnit = units.find(u => u.id === value);
            if (selectedUnit) {
                newItems[index].unitName = selectedUnit.name;
                newItems[index].conversionRate = selectedUnit.conversionRate;
            }
        }

        setItems(newItems);
    };

    const handleSubmit = async () => {
        if (!selectedSupplierId || items.length === 0) return;
        setSubmitting(true);
        try {
            const supplier = suppliers.find(s => s.id === selectedSupplierId);
            const orderData = {
                supplierId: selectedSupplierId,
                supplierName: supplier?.name || '',
                note,
                receivedDate: new Date(inboundDate).toISOString(),
                performer,
                items: items.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    sku: item.sku,
                    productName: item.productName,
                    unitPrice: item.unitPrice,
                    requestQuantity: item.requestQuantity,
                    receivedQuantity: item.receivedQuantity,
                    uomId: item.unitId || '',
                    uomName: item.unitName || '',
                    conversionRate: item.conversionRate || 1
                }))
            };

            if (isEdit && id) {
                await InboundService.update(id, orderData);
            } else {
                await InboundService.create(orderData);
            }
            navigate('..');
        } catch (error) {
            console.error(error);
            alert(`Lỗi ${isEdit ? 'cập nhật' : 'tạo'} phiếu nhập`);
        } finally {
            setSubmitting(false);
        }
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.receivedQuantity * item.unitPrice), 0);

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Tạo Phiếu Nhập Kho</h2>
                    <p className="text-muted-foreground text-sm">Vui lòng điền thông tin bên dưới để thêm bản ghi mới.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('..')} className="rounded-full shadow-sm text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                </Button>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                            <Label>Nhà cung cấp *</Label>
                            <select
                                className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all cursor-pointer"
                                value={selectedSupplierId}
                                onChange={(e) => setSelectedSupplierId(e.target.value)}
                            >
                                <option value="">-- Chọn Nhà Cung Cấp --</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Ngày nhập kho</Label>
                            <Input
                                type="date"
                                value={inboundDate}
                                onChange={(e) => setInboundDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Nhân viên thực hiện</Label>
                            <Input
                                value={performer}
                                onChange={(e) => setPerformer(e.target.value)}
                                placeholder="Tên nhân viên..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Loại nhập kho</Label>
                            <select
                                className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all cursor-pointer"
                                defaultValue="Standard"
                            >
                                <option value="Standard">Standard</option>
                                <option value="Return">Return</option>
                                <option value="Transfer">Transfer</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="relative">
                            <Input
                                placeholder="Quét mã vạch hoặc tìm kiếm sản phẩm..."
                                className="pl-4 pr-10 cursor-pointer"
                                onClick={() => setIsProductSelectorOpen(true)}
                                readOnly
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <Plus className="h-4 w-4" />
                            </div>
                        </div>

                        <ProductSelectorDialog
                            open={isProductSelectorOpen}
                            onOpenChange={setIsProductSelectorOpen}
                            onSelect={handleAddItem}
                        />

                        <div className="border rounded-lg overflow-hidden border-slate-200">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 text-left font-semibold text-slate-700 w-10 text-center">#</th>
                                        <th className="p-4 text-left font-semibold text-slate-700">Sản phẩm</th>
                                        <th className="p-4 text-left font-semibold text-slate-700 w-32 text-center">Đơn vị</th>
                                        <th className="p-4 text-right font-semibold text-slate-700 w-32">Đơn giá</th>
                                        <th className="p-4 text-right font-semibold text-slate-700 w-32">Số lượng</th>
                                        <th className="p-4 text-right font-semibold text-slate-700 w-32">Thành tiền</th>
                                        <th className="p-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="p-12 text-center text-muted-foreground italic bg-slate-50/20">
                                                Thêm sản phẩm vào danh sách bằng cách tìm kiếm hoặc quét mã vạch
                                            </td>
                                        </tr>
                                    )}
                                    {items.map((item, index) => {
                                        const units = productUnits[item.productId] || [];
                                        return (
                                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-3 text-center text-slate-400 font-medium">{index + 1}</td>
                                                <td className="p-3">
                                                    <div className="font-semibold text-slate-900">{item.sku}</div>
                                                    <div className="text-xs text-muted-foreground line-clamp-1">{item.productName}</div>
                                                </td>
                                                <td className="p-3">
                                                    {units.length > 0 ? (
                                                        <select
                                                            className="w-full border border-slate-200 rounded-md h-9 text-xs px-2 bg-white"
                                                            value={item.unitId || ''}
                                                            onChange={(e) => handleItemChange(index, 'unitId', e.target.value)}
                                                            
                                                        >
                                                            {units.map(u => (
                                                                <option key={u.id} value={u.id}>{u.name}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <div className="text-center text-slate-500 text-xs py-2">--</div>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right">
                                                    <Input
                                                        type="number"
                                                        className="h-9 text-right px-2 w-full border-slate-200"
                                                        value={item.unitPrice}
                                                        onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                                                    />
                                                </td>
                                                <td className="p-3 text-right">
                                                    <Input
                                                        type="number"
                                                        className="h-9 text-right px-2 w-full font-bold text-slate-900 border-slate-200"
                                                        value={item.receivedQuantity}
                                                        onChange={(e) => handleItemChange(index, 'receivedQuantity', Number(e.target.value))}
                                                    />
                                                </td>
                                                <td className="p-3 text-right font-semibold text-slate-900">
                                                    {(item.receivedQuantity * item.unitPrice).toLocaleString()}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive transition-colors" onClick={() => handleRemoveItem(index)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100">
                        <Label>Tệp đính kèm</Label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50/30 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                            <div className="text-primary font-semibold group-hover:underline">Chọn tệp</div>
                            <div className="text-muted-foreground text-sm mt-1">hoặc kéo và thả tại đây</div>
                            <div className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider">Hỗ trợ: .png, .jpg, .pdf, .docx, .xlsx, .zip</div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100">
                        <Label>Ghi chú chi tiết</Label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all resize-none"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Số hóa đơn, ghi chú nhận hàng, tình trạng hàng hóa..."
                        />
                    </div>
                </div>

                <div className="bg-slate-50/80 px-8 py-6 border-t flex items-center justify-between">
                    <div className="flex gap-12">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng sản phẩm</span>
                            <div className="text-xl font-bold text-slate-900">
                                {items.reduce((s, i) => s + i.receivedQuantity, 0)} <span className="text-sm font-normal text-muted-foreground">mặt hàng</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng giá trị</span>
                            <div className="text-xl font-bold text-primary">
                                {totalAmount.toLocaleString()} <span className="text-sm font-normal text-primary/70">VNĐ</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex items-center gap-2 mr-6">
                            <input type="checkbox" id="draft" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                            <Label htmlFor="draft" className="text-sm text-slate-600 font-medium">Bản nháp</Label>
                        </div>
                        <Button size="lg" className="px-12 shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit} disabled={submitting || !selectedSupplierId || items.length === 0}>
                            <Save className="mr-2 h-4 w-4" /> Hoàn tất
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
