import { useEffect, useState } from 'react';
import { InboundService } from '@/shared-bridge';
import type { InboundOrder } from '@/shared-bridge';
import { Button, Input } from '@/components/ui';
import { Plus, Eye, ChevronDown, Edit2, Check, X, ArrowRightLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InboundList = () => {
    const [orders, setOrders] = useState<InboundOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await InboundService.getAll();
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (confirm('Xác nhận duyệt phiếu nhập và cập nhật tồn kho?')) {
            await InboundService.approve(id);
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
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Phiếu Nhập Kho</h2>
                    <p className="text-muted-foreground text-sm">Quản lý lịch sử nhập hàng và tồn kho.</p>
                </div>

                {/* Group Buttons */}
                <div className="flex gap-3">
                    <Link to="../inventory/transfer">
                        <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold tracking-tight px-4 h-9 text-xs">
                            <ArrowRightLeft className="mr-2 h-4 w-4" /> CHUYỂN KHO
                        </Button>
                    </Link>

                    <Link to="new">
                        <Button className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold tracking-tight px-4 h-9 text-xs shadow-lg shadow-indigo-200">
                            <Plus className="mr-2 h-4 w-4" /> TẠO PHIẾU NHẬP
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
                    <Input placeholder="Search by code or supplier..." className="h-9 shadow-none border-slate-200" />
                </div>
                <Button variant="ghost" className="text-slate-500 font-medium h-9 text-xs">Reset</Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs w-[25%] pb-6">Inbound</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs w-[25%] pb-6">Relations</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs pb-6">Details</th>
                            <th className="p-4 w-10 pb-6"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-muted-foreground italic bg-slate-50/20">
                                    Chưa có phiếu nhập hàng nào.
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
                                            <div className="text-slate-500 text-xs text-uppercase tracking-wider">
                                                {new Date(order.receivedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                                                <span className="text-slate-400">Supplier:</span>
                                                <span className="text-slate-600 font-medium">{order.supplierName}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <span className="text-slate-400">Performer:</span>
                                                <span className="text-slate-600 font-medium">{order.createdBy || 'Admin'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 max-w-md">
                                            {order.note || 'No additional notes provided.'}
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
                                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 shadow-sm transition-all" onClick={() => handleApprove(order.id)} title="Duyệt đơn hàng">
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