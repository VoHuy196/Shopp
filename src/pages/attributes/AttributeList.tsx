import { useEffect, useState } from 'react';
import { AttributeService } from '@/services';
import type { Attribute } from '@/types';
import { Button, Input, Label } from '@/components/ui';
import { Plus, Trash2, Tag, ChevronRight, Settings2, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AttributeList = () => {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAttrId, setSelectedAttrId] = useState<string>('');
    const [newAttrName, setNewAttrName] = useState('');
    const [newValue, setNewValue] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await AttributeService.getAll();
            setAttributes(data);
            if (data.length > 0 && !selectedAttrId) {
                setSelectedAttrId(data[0].id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAttribute = async () => {
        if (!newAttrName.trim()) return;
        try {
            const newAttr = await AttributeService.create({ name: newAttrName });
            setAttributes([...attributes, newAttr]);
            setNewAttrName('');
            setSelectedAttrId(newAttr.id);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteAttribute = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Xóa thuộc tính này sẽ xóa tất cả các giá trị đi kèm. Tiếp tục?')) return;
        try {
            await AttributeService.delete(id);
            const filtered = attributes.filter(a => a.id !== id);
            setAttributes(filtered);
            if (selectedAttrId === id) {
                setSelectedAttrId(filtered[0]?.id || '');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddValue = async () => {
        if (!newValue.trim() || !selectedAttrId) return;
        try {
            const val = await AttributeService.addValue({
                attributeId: selectedAttrId,
                value: newValue
            });
            const updated = attributes.map(a => {
                if (a.id === selectedAttrId) {
                    return { ...a, values: [...a.values, val] };
                }
                return a;
            });
            setAttributes(updated);
            setNewValue('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteValue = async (attrId: string, valueId: string) => {
        try {
            await AttributeService.deleteValue(attrId, valueId);
            const updated = attributes.map(a => {
                if (a.id === attrId) {
                    return { ...a, values: a.values.filter(v => v.id !== valueId) };
                }
                return a;
            });
            setAttributes(updated);
        } catch (error) {
            console.error(error);
        }
    };

    const selectedAttr = attributes.find(a => a.id === selectedAttrId);

    if (loading) return (
        <div className="flex h-[400px] items-center justify-center">
            <div className="text-muted-foreground animate-pulse text-lg">Đang tải dữ liệu...</div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Thuộc Tính Sản Phẩm</h2>
                    <p className="text-muted-foreground text-sm">Quản lý các thuộc tính (Màu sắc, Kích thước...) và giá trị của chúng.</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 h-9 cursor-pointer hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-semibold text-slate-600">Filter</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex-1 max-w-sm">
                    <Input placeholder="Tìm kiếm thuộc tính..." className="h-9 shadow-none border-slate-200" />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* --- LEFT: ATTRIBUTES --- */}
                <div className="w-full md:w-80 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-widest px-2">
                            <Settings2 className="h-4 w-4" />
                            Danh sách Thuộc tính
                        </div>

                        <div className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-lg">
                            <Input
                                placeholder="Thuộc tính mới..."
                                value={newAttrName}
                                onChange={e => setNewAttrName(e.target.value)}
                                className="h-9 border-0 bg-transparent shadow-none text-sm placeholder:text-slate-400"
                            />
                            <Button size="icon" variant="ghost" onClick={handleCreateAttribute} disabled={!newAttrName} className="h-9 w-9 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-1">
                            {attributes.map(a => (
                                <div
                                    key={a.id}
                                    onClick={() => setSelectedAttrId(a.id)}
                                    className={cn(
                                        "group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all border",
                                        selectedAttrId === a.id
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md font-bold"
                                            : "hover:bg-slate-50 text-slate-600 border-transparent"
                                    )}
                                >
                                    <div className="truncate flex-1" title={a.name}>{a.name}</div>
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className={cn("h-4 w-4 transition-transform", selectedAttrId === a.id ? "rotate-90 text-white" : "text-slate-300 opacity-0 group-hover:opacity-100")} />
                                        <button
                                            className={cn(
                                                "p-1 rounded hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100",
                                                selectedAttrId === a.id && "hidden"
                                            )}
                                            onClick={(e) => handleDeleteAttribute(a.id, e)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {attributes.length === 0 && <div className="text-xs text-slate-400 text-center py-8 italic">Chưa có thuộc tính nào</div>}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: VALUES --- */}
                <div className="flex-1">
                    {selectedAttrId ? (
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                                        <Tag className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg">Giá trị cho: {selectedAttr?.name}</h3>
                                </div>
                                <p className="text-slate-500 text-xs text-muted-foreground uppercase tracking-wider font-bold">Quản lý các biến thể có thể có của thuộc tính này.</p>
                            </div>

                            {/* Add Value */}
                            <div className="p-4 bg-white flex gap-4 border-b border-slate-100">
                                <div className="flex-1 space-y-1.5">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Giá trị mới</Label>
                                    <Input
                                        value={newValue}
                                        onChange={e => setNewValue(e.target.value)}
                                        placeholder="VD: Đỏ, Xanh, XL, 42..."
                                        className="h-10 text-sm border-slate-200 focus:ring-slate-900"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddValue()}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={handleAddValue} disabled={!newValue || loading} className="h-9 bg-indigo-600 text-white hover:bg-indigo-700 px-4 font-bold text-xs shadow-lg shadow-indigo-200">
                                        <Plus className="mr-2 h-4 w-4" /> THÊM GIÁ TRỊ
                                    </Button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex flex-wrap gap-3">
                                    {selectedAttr?.values.map((v) => (
                                        <div key={v.id} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-full text-slate-700 font-medium group hover:bg-slate-100 hover:border-slate-200 transition-all">
                                            <span>{v.value}</span>
                                            <button
                                                onClick={() => handleDeleteValue(selectedAttrId, v.id)}
                                                className="text-slate-300 hover:text-red-600 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {selectedAttr?.values.length === 0 && (
                                        <div className="w-full text-center py-12 text-slate-400 italic">
                                            Chưa có giá trị nào cho thuộc tính này.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-xl min-h-[500px] border-dashed">
                            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                                <Settings2 className="h-8 w-8 text-slate-200" />
                            </div>
                            <h3 className="text-slate-900 font-bold">Chưa chọn thuộc tính</h3>
                            <p className="text-sm">Chọn hoặc tạo một Thuộc tính ở bên trái để bắt đầu thiết lập.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
