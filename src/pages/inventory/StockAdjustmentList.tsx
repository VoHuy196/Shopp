import { useEffect, useState } from 'react';
import { InventoryService } from '@/services';
import type { StockAdjustment } from '@/types';
import { Button, Input } from '@/components/ui';
import { Plus, Eye, ChevronDown, ClipboardList, Calendar, User, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StockAdjustmentList = () => {
    const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await InventoryService.getAll();
            setAdjustments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Kiểm Kê & Điều Chỉnh</h2>
                    <p className="text-muted-foreground text-sm">Quản lý lịch sử và các phiếu điều chỉnh tồn kho hệ thống.</p>
                </div>

                <Link to="transfer">
                    <Button className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold tracking-tight px-4 h-9 text-xs shadow-lg shadow-indigo-200">
                        <Plus className="mr-2 h-4 w-4" /> TẠO PHIẾU MỚI
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
                    <Input placeholder="Search by code or reason..." className="h-9 shadow-none border-slate-200" />
                </div>
                <Button variant="ghost" className="text-slate-500 font-medium h-9 text-xs">Reset</Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs w-[30%] pb-6">Adjustment Info</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs w-[30%] pb-6">Creator & Date</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs pb-6">Summary</th>
                            <th className="p-4 w-10 pb-6"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {adjustments.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-muted-foreground italic bg-slate-50/20">
                                    Chưa có phiếu kiểm kê nào.
                                </td>
                            </tr>
                        )}
                        {adjustments.map((adj) => (
                            <tr key={adj.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 align-top">
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0">
                                            <ClipboardList className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="font-bold text-slate-700 text-sm">{adj.code}</div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100 uppercase tracking-wider">
                                                    {adj.reason === 'STOCK_TAKE' ? 'Kiểm kê định kỳ' : adj.reason}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                            <User className="h-3.5 w-3.5 text-slate-400" />
                                            <span>{adj.adjustedBy}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-400 ml-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{new Date(adj.adjustmentDate).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <FileText className="h-3.5 w-3.5 text-slate-300" />
                                        <span>{adj.items.length} items modified</span>
                                    </div>
                                </td>
                                <td className="p-4 align-top text-right">
                                    <div className="flex items-center justify-end gap-1 px-4">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm transition-all">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


