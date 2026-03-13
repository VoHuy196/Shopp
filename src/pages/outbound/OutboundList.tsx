import { useEffect, useState } from 'react';
import { OutboundService } from '@/services';
import type { OutboundOrder } from '@/types';
import { Button, Input } from '@/components/ui';
import { Plus, ChevronDown, Eye, Edit2, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OutboundList = () => {
    const [orders, setOrders] = useState<OutboundOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await OutboundService.getAll();
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (confirm('Xác nhận xuất kho cho đơn hàng này?')) {
            await OutboundService.approve(id);
            loadData();
        }
    };

    if (loading) return (
        <div className="flex h-[400px] items-center justify-center">
            <div className="text-muted-foreground animate-pulse text-lg">Đang tải dữ liệu...</div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Checkouts</h2>
                    <p className="text-muted-foreground text-sm">Please review the data in the table below</p>
                </div>

                <div className="flex gap-3">
                    <Link to="retail">
                        <Button variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-bold tracking-tight h-9 text-xs px-4">
                            POS RETAIL
                        </Button>
                    </Link>
                    <Link to="wholesale">
                        <Button className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold tracking-tight px-4 h-9 text-xs shadow-lg shadow-indigo-200">
                            <Plus className="mr-2 h-4 w-4" /> CREATE NEW CHECKOUT
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 h-9 cursor-pointer hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-semibold text-slate-600">Filter</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex-1 max-w-sm">
                    <Input placeholder="Search by order ID or customer..." className="h-9 shadow-none border-slate-200" />
                </div>
                <Button variant="ghost" className="text-slate-500 font-medium h-9 text-xs">Reset</Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs w-[25%] pb-6">Checkout</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs w-[25%] pb-6">Relations</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs pb-6">Details</th>
                            <th className="p-4 w-10 pb-6"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-muted-foreground italic bg-slate-50/20">
                                    Chưa có phiếu xuất hàng nào.
                                </td>
                            </tr>
                        )}
                        {orders.map((order) => {
                            const isDraft = order.status === 'DRAFT';
                            return (
                                <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 align-top">
                                        <div className="space-y-1">
                                            <div className="font-bold text-slate-700 text-sm">{order.code}</div>
                                            <div className="text-slate-500 text-xs">
                                                {new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400 text-xs font-medium">Draft:</span>
                                                {isDraft ? (
                                                    <X className="h-3 w-3 text-red-500 font-bold" />
                                                ) : (
                                                    <Check className="h-3 w-3 text-emerald-500 font-bold" />
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="space-y-1 text-xs">
                                            <div className="flex gap-1">
                                                <span className="text-slate-400">Contact:</span>
                                                <span className="text-slate-600 font-medium">{order.customerName}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <span className="text-slate-400">Warehouse:</span>
                                                <span className="text-slate-600 font-medium">Main Warehouse</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <span className="text-slate-400">User:</span>
                                                <span className="text-slate-600 font-medium">{order.createdBy || 'Admin'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 max-w-md">
                                            {order.note || 'No additional details provided for this checkout transaction.'}
                                        </p>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="flex items-center justify-end gap-1 px-4">
                                            <Link to={`${order.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-all" title="Xem chi tiết">
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                            </Link>
                                            <Link to={`${order.id}/edit`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-amber-500 text-white rounded-md hover:bg-amber-600 shadow-sm transition-all" title="Sửa đơn hàng">
                                                    <Edit2 className="h-3 w-3" />
                                                </Button>
                                            </Link>
                                            {isDraft && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm transition-all" onClick={() => handleApprove(order.id)} title="Duyệt đơn hàng">
                                                    <Check className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

