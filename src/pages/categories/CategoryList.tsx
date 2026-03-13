import { useEffect, useState } from 'react';
import { CategoryService } from '@/services';
import type { Category } from '@/types';
import { Button, Input } from '@/components/ui';
import { Plus, ChevronDown, Edit2, Trash2, Tag, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CategoryList = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await CategoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Xóa nhóm này? Lưu ý: Các sản phẩm thuộc nhóm này sẽ mất liên kết.')) {
            await CategoryService.delete(id);
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
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Nhóm Sản Phẩm</h2>
                    <p className="text-muted-foreground text-sm">Phân loại sản phẩm và thiết lập ngưỡng tồn kho tối thiểu.</p>
                </div>

                <Link to="new">
                    <Button className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold tracking-tight px-4 h-9 text-xs shadow-lg shadow-indigo-200">
                        <Plus className="mr-2 h-4 w-4" /> THÊM NHÓM
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
                    <Input placeholder="Search categories..." className="h-9 shadow-none border-slate-200" />
                </div>
                <Button variant="ghost" className="text-slate-500 font-medium h-9 text-xs">Reset</Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs w-[40%] pb-6">Category Detail</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs w-[30%] pb-6">Inventory Rule</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs pb-6">Description</th>
                            <th className="p-4 w-10 pb-6"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-muted-foreground italic bg-slate-50/20">
                                    Chưa có nhóm sản phẩm nào.
                                </td>
                            </tr>
                        )}
                        {categories.map((cat) => (
                            <tr key={cat.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 align-top">
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0">
                                            <Tag className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="font-bold text-slate-700 text-sm">{cat.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                            <span>Min Threshold: <span className="text-red-600 font-bold">{cat.minStockThreshold}</span></span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 max-w-sm">
                                        {cat.description || 'No description provided.'}
                                    </p>
                                </td>
                                <td className="p-4 align-top text-right">
                                    <div className="flex items-center justify-end gap-1 px-4">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-amber-500 text-white rounded-md hover:bg-amber-600 shadow-sm transition-all">
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm transition-all" onClick={() => handleDelete(cat.id)}>
                                            <Trash2 className="h-3 w-3" />
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
