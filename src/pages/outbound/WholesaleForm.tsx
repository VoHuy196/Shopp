import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { OutboundService, UnitGroupService, ProductService } from '@/services';
import type { Product, ProductVariant, Unit, PaymentMethod, PaymentItem } from '@/types';
import { Button, Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ArrowLeft, Save, Plus, Trash2, CreditCard, Banknote, Building2 } from 'lucide-react';
import { ProductSelectorDialog } from '@/components/common/ProductSelectorDialog';

interface OrderItemRow {
    productId: string;
    variantId: string;
    productName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    maxQuantity: number;
    unitId?: string;
    unitName?: string;
    conversionRate?: number;
}

const MOCK_CUSTOMERS = [
    { id: 'c1', name: 'Công ty TNHH Thành Phát' },
    { id: 'c2', name: 'Đại lý Bán lẻ Minh Anh' },
    { id: 'c3', name: 'Siêu thị Coop Mart' },
    { id: 'c4', name: 'Nhà phân phối Miền Đông' },
];

export const WholesaleForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(isEdit);

    const [customerName, setCustomerName] = useState('');
    const [note, setNote] = useState('');
    const [items, setItems] = useState<OrderItemRow[]>([]);
    const [productUnits, setProductUnits] = useState<Record<string, Unit[]>>({});

    // New Fields
    const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
    const [performer, setPerformer] = useState('Admin');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
    const [payments, setPayments] = useState<PaymentItem[]>([]);

    const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

    useEffect(() => {
        if (isEdit && id) {
            loadOrder(id);
        }
    }, [id, isEdit]);

    const loadOrder = async (orderId: string) => {
        try {
            const order = await OutboundService.getById(orderId);
            if (order) {
                setCustomerName(order.customerName);
                setNote(order.note || '');
                setExportDate(order.exportDate || new Date().toISOString().split('T')[0]);
                setPerformer(order.createdBy || 'Admin');
                setPaymentMethod(order.paymentMethod || 'CASH');
                setPayments(order.payments || []);
                
                // Fetch product variants to get maxQuantity
                // For DRAFT orders, we add back the ordered quantity to the current stock
                // since DRAFT orders don't deduct stock yet
                const itemsWithMaxQuantity = await Promise.all(
                    order.items.map(async (item) => {
                        let maxQuantity = 999;
                        try {
                            const product = await ProductService.getById(item.productId);
                            if (product?.variants) {
                                const variant = product.variants.find(v => v.id === item.variantId);
                                if (variant) {
                                    // For DRAFT orders, stock wasn't deducted, so show current stock
                                    maxQuantity = variant.quantity || 999;
                                }
                            }
                        } catch (e) {
                            console.warn('Failed to fetch variant stock:', e);
                        }
                        
                        return {
                            productId: item.productId,
                            variantId: item.variantId,
                            productName: item.productName,
                            sku: item.sku,
                            unitPrice: item.unitPrice,
                            quantity: item.quantity,
                            maxQuantity,
                            unitId: item.unitId,
                            unitName: item.unitName,
                            conversionRate: item.conversionRate
                        };
                    })
                );
                setItems(itemsWithMaxQuantity);
            }
        } catch (error) {
            console.error('Failed to load order:', error);
            alert('Không tìm thấy đơn hàng');
            navigate('..');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = useMemo(() => items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0), [items]);

    const handleAddItem = async (product: Product, variant: ProductVariant) => {
        const price = variant.salePrice || variant.price * 1.2;

        let units = productUnits[product.id];
        if (product.unitGroupId && !units) {
            units = await UnitGroupService.getByGroupId(product.unitGroupId);
            setProductUnits(prev => ({ ...prev, [product.id]: units }));
        }

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
            unitPrice: price,
            quantity: 1,
            maxQuantity: variant.quantity || 0,
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
        const item = newItems[index];

        if (field === 'quantity') {
            const rate = item.conversionRate || 1;
            if (value * rate > item.maxQuantity) {
                alert(`Không đủ tồn kho! Tồn: ${item.maxQuantity}.`);
                return;
            }
        }

        (newItems[index] as any)[field] = value;

        if (field === 'unitId') {
            const units = productUnits[item.productId] || [];
            const selectedUnit = units.find(u => u.id === value);
            if (selectedUnit) {
                newItems[index].unitName = selectedUnit.name;
                newItems[index].conversionRate = selectedUnit.conversionRate;
            }
        }

        setItems(newItems);
    };

    const handleAddPayment = () => {
        const remaining = totalAmount - payments.reduce((sum, p) => sum + p.amount, 0);
        setPayments([...payments, { method: 'CASH', amount: Math.max(0, remaining) }]);
    };

    const updatePayment = (index: number, field: keyof PaymentItem, value: any) => {
        const newPayments = [...payments];
        (newPayments[index] as any)[field] = value;
        setPayments(newPayments);
    };

    const removePayment = (index: number) => {
        setPayments(payments.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!customerName || items.length === 0) return;
        setSubmitting(true);
        try {
            const orderData = {
                type: 'WHOLESALE' as const,
                customerName,
                note,
                exportDate: new Date(exportDate).toISOString(),
                performer,
                paymentMethod,
                payments: paymentMethod === 'MULTIPLE' ? payments : undefined,
                items: items.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    sku: item.sku,
                    productName: item.productName,
                    unitPrice: item.unitPrice,
                    quantity: item.quantity,
                    uomId: item.unitId,
                    uomName: item.unitName,
                    conversionRate: item.conversionRate
                }))
            };

            if (isEdit && id) {
                await OutboundService.update(id, orderData);
            } else {
                await OutboundService.create(orderData);
            }
            navigate('..');
        } catch (error) {
            console.error(error);
            alert(`Lỗi ${isEdit ? 'cập nhật' : 'tạo'} đơn hàng`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{isEdit ? 'Sửa Đơn Bán Buôn' : 'Tạo Đơn Bán Buôn'}</h2>
                    <p className="text-muted-foreground text-sm">Quản lý bán sỉ và thanh toán linh hoạt cho khách đối tác.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('..')} className="rounded-full shadow-sm text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">
                    {/* General Info */}
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-slate-50/50 px-8 py-4 border-b">
                            <h3 className="font-bold flex items-center gap-2 text-slate-700">
                                <Building2 className="h-4 w-4 text-primary" /> Thông tin khách hàng
                            </h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <Label>Khách hàng *</Label>
                                <select
                                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all cursor-pointer"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                >
                                    <option value="">-- Chọn khách hàng --</option>
                                    {MOCK_CUSTOMERS.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    <option value="Khác">Khác (Nhập thủ công)</option>
                                </select>
                                {customerName === 'Khác' && (
                                    <Input
                                        className="mt-2"
                                        placeholder="Nhập tên khách hàng mới"
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Ngày xuất kho</Label>
                                <Input type="date" value={exportDate} onChange={(e) => setExportDate(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Nhân viên</Label>
                                <Input value={performer} onChange={(e) => setPerformer(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Ghi chú đơn hàng</Label>
                                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú về giao hàng, chiết khấu..." />
                            </div>
                        </div>
                    </div>

                    {/* Search & Items Section */}
                    <div className="space-y-4">
                        <div className="relative group">
                            <Input
                                placeholder="Quét mã vạch hoặc tìm sản phẩm (F2)..."
                                className="pl-4 pr-10 cursor-pointer h-12 text-lg shadow-sm border-slate-200 group-hover:border-primary transition-all"
                                onClick={() => setIsProductSelectorOpen(true)}
                                readOnly
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                                <Plus className="h-5 w-5" />
                            </div>
                        </div>

                        <ProductSelectorDialog
                            open={isProductSelectorOpen}
                            onOpenChange={setIsProductSelectorOpen}
                            onSelect={handleAddItem}
                            showQuantity={true}
                        />

                        <div className="bg-white border rounded-xl shadow-sm overflow-hidden border-slate-200">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 text-left font-semibold text-slate-700">Sản phẩm</th>
                                        <th className="p-4 text-left font-semibold text-slate-700 w-32 text-center">Đơn vị</th>
                                        <th className="p-4 text-right font-semibold text-slate-700 w-32">Giá (đ)</th>
                                        <th className="p-4 text-right font-semibold text-slate-700 w-24">SL</th>
                                        <th className="p-4 text-right font-semibold text-slate-700 w-40">Thành tiền</th>
                                        <th className="p-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-muted-foreground italic bg-slate-50/20">
                                                Vui lòng thêm sản phẩm vào danh sách
                                            </td>
                                        </tr>
                                    )}
                                    {items.map((item, index) => (
                                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-900">{item.sku}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">{item.productName}</div>
                                            </td>
                                            <td className="p-4">
                                                {productUnits[item.productId]?.length > 0 ? (
                                                    <select
                                                        className="w-full border border-slate-200 rounded-md h-9 text-xs px-2 bg-white"
                                                        value={item.unitId  || ''}
                                                        onChange={(e) => handleItemChange(index, 'unitId', e.target.value)}
                                                    >
                                                        {productUnits[item.productId].map(u => (
                                                            <option key={u.id} value={u.id}>{u.name}</option>
                                                        ))}
                                                    </select>
                                                ) : <div className="text-center text-slate-400 text-xs">Mặc định</div>}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Input
                                                    type="number"
                                                    className="h-9 text-right px-2 border-slate-200"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-4 text-right">
                                                <Input
                                                    type="number"
                                                    className="h-9 text-right px-2 font-bold border-slate-200"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-4 text-right font-bold text-slate-900">
                                                {(item.quantity * item.unitPrice).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-center">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive transition-colors" onClick={() => handleRemoveItem(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                    {/* Payment Summary Box */}
                    <div className="bg-white border rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
                        <div className="p-6 bg-slate-900 text-white">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" /> Thanh toán
                            </h3>
                            <div className="mt-4 space-y-1">
                                <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Tổng giá trị đơn hàng</span>
                                <div className="text-3xl font-black text-white">{totalAmount.toLocaleString()} <span className="text-sm font-normal text-slate-400">VNĐ</span></div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-slate-500 text-xs uppercase tracking-widest font-bold">Hình thức thanh toán</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant={paymentMethod === 'CASH' ? 'default' : 'outline'}
                                        size="sm" onClick={() => setPaymentMethod('CASH')}
                                        className={cn("text-xs font-bold rounded-lg h-10", paymentMethod === 'CASH' ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" : "text-indigo-600 border-indigo-200 hover:bg-indigo-50")}
                                    >
                                        <Banknote className="mr-2 h-4 w-4" /> Tiền mặt
                                    </Button>
                                    <Button
                                        variant={paymentMethod === 'BANK_TRANSFER' ? 'default' : 'outline'}
                                        size="sm" onClick={() => setPaymentMethod('BANK_TRANSFER')}
                                        className={cn("text-xs font-bold rounded-lg h-10", paymentMethod === 'BANK_TRANSFER' ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" : "text-indigo-600 border-indigo-200 hover:bg-indigo-50")}
                                    >
                                        Chuyển khoản
                                    </Button>
                                    <Button
                                        variant={paymentMethod === 'CREDIT' ? 'default' : 'outline'}
                                        size="sm" onClick={() => setPaymentMethod('CREDIT')}
                                        className={cn("text-xs font-bold rounded-lg h-10", paymentMethod === 'CREDIT' ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" : "text-indigo-600 border-indigo-200 hover:bg-indigo-50")}
                                    >
                                        Ghi nợ
                                    </Button>
                                    <Button
                                        variant={paymentMethod === 'MULTIPLE' ? 'default' : 'outline'}
                                        size="sm" onClick={() => setPaymentMethod('MULTIPLE')}
                                        className={cn("text-xs font-bold rounded-lg h-10", paymentMethod === 'MULTIPLE' ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" : "text-indigo-600 border-indigo-200 hover:bg-indigo-50")}
                                    >
                                        Hỗn hợp
                                    </Button>
                                </div>
                            </div>

                            {paymentMethod === 'MULTIPLE' && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phân bổ thanh toán</Label>
                                        <Button variant="ghost" size="sm" className="h-7 text-xs text-primary font-bold hover:bg-primary/5 rounded-full" onClick={handleAddPayment}>
                                            <Plus className="h-3 w-3 mr-1" /> Thêm tệp
                                        </Button>
                                    </div>
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                        {payments.map((p, i) => (
                                            <div key={i} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-3 relative group">
                                                <div className="flex gap-2">
                                                    <select
                                                        className="h-9 flex-1 rounded-lg border border-slate-200 bg-white text-xs px-3 font-semibold"
                                                        value={p.method}
                                                        onChange={(e) => updatePayment(i, 'method', e.target.value)}
                                                    >
                                                        <option value="CASH">Tiền mặt</option>
                                                        <option value="BANK_TRANSFER">Chuyển khoản</option>
                                                        <option value="CREDIT">Ghi nợ</option>
                                                    </select>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100" onClick={() => removePayment(i)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        className="h-10 text-right font-bold pr-12 rounded-lg border-slate-200"
                                                        value={p.amount}
                                                        onChange={(e) => updatePayment(i, 'amount', Number(e.target.value))}
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">VNĐ</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                                        <div className="flex justify-between text-xs font-bold text-slate-500">
                                            <span>ĐÃ PHÂN BỔ</span>
                                            <span>{Math.round((payments.reduce((sum, p) => sum + p.amount, 0) / totalAmount) * 100)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-500"
                                                style={{ width: `${Math.min(100, (payments.reduce((sum, p) => sum + p.amount, 0) / totalAmount) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                            <span>{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
                                            <span>{totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button
                                className="w-full h-14 text-lg font-black rounded-xl shadow-xl shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 mt-4"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={submitting || !customerName || items.length === 0}
                            >
                                <Save className="mr-3 h-6 w-6" />
                                {submitting ? 'ĐANG LƯU...' : (isEdit ? 'CẬP NHẬT ĐƠN HÀNG' : 'HOÀN TẤT ĐƠN HÀNG')}
                            </Button>

                            <p className="text-[10px] text-center text-slate-400 italic">Bằng cách nhấn {isEdit ? 'cập nhật' : 'hoàn tất'}, đơn hàng sẽ được {isEdit ? 'cập nhật' : 'lưu và trừ'} tồn kho hệ thống.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
