import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { InboundService, ProductService } from '@/services';
import type { InboundOrder } from '@/types';
import { Button } from '@/components/ui';
import { ArrowLeft, Edit2 } from 'lucide-react';

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

export const InboundDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<InboundOrder | null>(null);
    const [items, setItems] = useState<OrderItemRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadOrder(id);
    }, [id]);

    const loadOrder = async (orderId: string) => {
        try {
            const data = await InboundService.getById(orderId);
            if (data) {
                setOrder(data);
                // Fetch product info for display
                const itemsData = await Promise.all(
                    data.items.map(async (item) => {
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
                    })
                );
                setItems(itemsData);
            }
        } catch (error) {
            console.error('Failed to load inbound order:', error);
            alert('Không tìm thấy phiếu nhập');
            navigate('..');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
    }

    if (!order) {
        return <div className="p-8 text-center text-slate-500">Không tìm thấy phiếu nhập</div>;
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.receivedQuantity * item.unitPrice), 0);
    const isDraft = order.status === 'DRAFT';

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Chi tiết Phiếu Nhập Kho</h2>
                    <p className="text-muted-foreground text-sm">{order.code}</p>
                </div>
                <div className="flex gap-3">
                    {isDraft && (
                        <Link to={`../inbound/${id}/edit`}>
                            <Button size="sm" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                                <Edit2 className="mr-2 h-4 w-4" /> Sửa
                            </Button>
                        </Link>
                    )}
                    <Button variant="outline" size="sm" onClick={() => navigate('..')} className="rounded-full shadow-sm text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                    </Button>
                </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-600">Nhà cung cấp</label>
                            <div className="text-sm font-semibold text-slate-900">{order.supplierName}</div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-600">Ngày nhập kho</label>
                            <div className="text-sm font-semibold text-slate-900">
                                {new Date(order.receivedDate).toLocaleDateString('vi-VN')}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-600">Nhân viên thực hiện</label>
                            <div className="text-sm font-semibold text-slate-900">{order.createdBy || 'Admin'}</div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-600">Trạng thái</label>
                            <div className={`text-sm font-semibold ${order.status === 'DRAFT' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {order.status === 'DRAFT' ? 'Nháp' : 'Hoàn tất'}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="font-semibold text-slate-900">Danh sách sản phẩm</h3>
                        <div className="border rounded-lg overflow-hidden border-slate-200">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 text-center font-semibold text-slate-700 w-10">#</th>
                                        <th className="p-4 text-left font-semibold text-slate-700">Sản phẩm</th>
                                        <th className="p-4 text-center font-semibold text-slate-700 w-32">Đơn vị</th>
                                        <th className="p-4 text-right font-semibold text-slate-700 w-32">Đơn giá</th>
                                        <th className="p-4 text-right font-semibold text-slate-700 w-32">Số lượng</th>
                                        <th className="p-4 text-right font-semibold text-slate-700 w-32">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((item, index) => (
                                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-3 text-center text-slate-400 font-medium">{index + 1}</td>
                                            <td className="p-3">
                                                <div className="font-semibold text-slate-900">{item.sku}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">{item.productName}</div>
                                            </td>
                                            <td className="p-3 text-center text-slate-600">{item.unitName || '--'}</td>
                                            <td className="p-3 text-right text-slate-600">{item.unitPrice.toLocaleString()}</td>
                                            <td className="p-3 text-right font-semibold text-slate-900">{item.receivedQuantity}</td>
                                            <td className="p-3 text-right font-semibold text-slate-900">
                                                {(item.receivedQuantity * item.unitPrice).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {order.note && (
                        <div className="space-y-2 pt-4 border-t border-slate-100">
                            <label className="text-sm font-medium text-slate-600">Ghi chú</label>
                            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{order.note}</div>
                        </div>
                    )}
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
                </div>
            </div>
        </div>
    );
};
