import { useState, useEffect, type MouseEvent } from 'react';
import { UOMService } from '@/services';
import type { UOM, UOMGroup } from '@/types';
import { Button, Input, Label } from '@/components/ui';
import { Scale, Trash2, X, Plus, Edit2, Check, ChevronRight, Layers, Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';

export const UOMList = () => {
    // --- Groups State ---
    const [groups, setGroups] = useState<UOMGroup[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [newGroupName, setNewGroupName] = useState('');

    // --- UOMs State ---
    const [uoms, setUoms] = useState<UOM[]>([]);
    const [loading, setLoading] = useState(false);

    // --- Inline Edit State ---
    const [editingUomId, setEditingUomId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ name: string, isBaseUnit: boolean, conversionRate: number }>({
        name: '', isBaseUnit: false, conversionRate: 1
    });

    // --- New UOM Form State ---
    const [newUomName, setNewUomName] = useState('');
    const [newUomIsBase, setNewUomIsBase] = useState(false);
    const [newUomRate, setNewUomRate] = useState<number>(1);

    useEffect(() => {
        loadGroups();
    }, []);

    useEffect(() => {
        if (selectedGroupId) {
            loadUOMs(selectedGroupId);
        } else {
            setUoms([]);
        }
    }, [selectedGroupId]);

    const loadGroups = async () => {
        const data = await UOMService.getGroups();
        setGroups(data);
        if (data.length > 0 && !selectedGroupId) setSelectedGroupId(data[0].id);
    };

    const loadUOMs = async (groupId: string) => {
        const data = await UOMService.getByGroupId(groupId);
        // Sort: Base unit first, then others
        data.sort((a, b) => (a.isBaseUnit === b.isBaseUnit ? 0 : a.isBaseUnit ? -1 : 1));
        setUoms(data);
    };

    // --- Group Actions ---
    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;
        try {
            const newGroup = await UOMService.createGroup({ name: newGroupName });
            setGroups([...groups, newGroup]);
            setNewGroupName('');
            setSelectedGroupId(newGroup.id);
        } catch (e) {
            alert("Lỗi tạo nhóm");
        }
    };

    const handleDeleteGroup = async (id: string, e: MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Xóa nhóm này sẽ xóa tất cả đơn vị bên trong. Tiếp tục?')) return;
        await UOMService.deleteGroup(id);
        const newGroups = groups.filter(g => g.id !== id);
        setGroups(newGroups);
        if (selectedGroupId === id) setSelectedGroupId(newGroups[0]?.id || '');
    };

    // --- UOM Actions ---
    const handleCreateUOM = async () => {
        if (!newUomName.trim() || !selectedGroupId) return;
        setLoading(true);
        try {
            await UOMService.createUOM({
                groupId: selectedGroupId,
                name: newUomName,
                isBaseUnit: newUomIsBase,
                conversionRate: newUomIsBase ? 1 : newUomRate
            });
            setNewUomName('');
            setNewUomIsBase(false);
            setNewUomRate(1);
            loadUOMs(selectedGroupId);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (uom: UOM) => {
        setEditingUomId(uom.id);
        setEditForm({
            name: uom.name,
            isBaseUnit: uom.isBaseUnit,
            conversionRate: uom.conversionRate
        });
    };

    const cancelEditing = () => {
        setEditingUomId(null);
    };

    const saveEditing = async (id: string) => {
        try {
            await UOMService.updateUOM(id, editForm);
            setEditingUomId(null);
            loadUOMs(selectedGroupId);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDeleteUOM = async (id: string) => {
        if (!confirm('Xóa đơn vị này?')) return;
        await UOMService.deleteUOM(id);
        loadUOMs(selectedGroupId);
    };

    const selectedGroup = groups.find(g => g.id === selectedGroupId);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Đơn Vị Tính</h2>
                    <p className="text-muted-foreground text-sm">Quản lý nhóm đơn vị và các đơn vị quy đổi tương ứng.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* --- LEFT: GROUPS --- */}
                <div className="w-full md:w-80 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-widest px-2">
                            <Layers className="h-4 w-4" />
                            Nhóm Đơn vị
                        </div>

                        <div className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-lg">
                            <Input
                                placeholder="Tên nhóm mới..."
                                value={newGroupName}
                                onChange={e => setNewGroupName(e.target.value)}
                                className="h-9 border-0 bg-transparent shadow-none text-sm placeholder:text-slate-400"
                            />
                            <Button size="icon" variant="ghost" onClick={handleCreateGroup} disabled={!newGroupName} className="h-9 w-9 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-1">
                            {groups.map(g => (
                                <div
                                    key={g.id}
                                    onClick={() => setSelectedGroupId(g.id)}
                                    className={cn(
                                        "group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all border",
                                        selectedGroupId === g.id
                                            ? "bg-slate-900 text-white border-slate-900 shadow-md font-bold"
                                            : "hover:bg-slate-50 text-slate-600 border-transparent"
                                    )}
                                >
                                    <div className="truncate flex-1" title={g.name}>{g.name}</div>
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className={cn("h-4 w-4 transition-transform", selectedGroupId === g.id ? "rotate-90 text-white" : "text-slate-300 opacity-0 group-hover:opacity-100")} />
                                        <button
                                            className={cn(
                                                "p-1 rounded hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100",
                                                selectedGroupId === g.id && "hidden"
                                            )}
                                            onClick={(e) => handleDeleteGroup(g.id, e as any)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {groups.length === 0 && <div className="text-xs text-slate-400 text-center py-8 italic">Chưa có nhóm nào</div>}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: UOMS --- */}
                <div className="flex-1">
                    {selectedGroupId ? (
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                                        <Boxes className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg">{selectedGroup?.name}</h3>
                                </div>
                                <p className="text-slate-500 text-xs">Phân rã đơn vị tính từ chuẩn xác đến quy đổi.</p>
                            </div>

                            {/* Add UOM */}
                            <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-4 gap-4 border-b border-slate-100">
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Tên đơn vị</Label>
                                    <Input
                                        value={newUomName}
                                        onChange={e => setNewUomName(e.target.value)}
                                        placeholder="VD: Thùng, Hộp, Cái..."
                                        className="h-10 text-sm border-slate-200 focus:ring-slate-900"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Loại</Label>
                                    <div
                                        onClick={() => setNewUomIsBase(!newUomIsBase)}
                                        className={cn(
                                            "flex items-center gap-2 border rounded-lg px-3 h-10 text-sm cursor-pointer transition-colors",
                                            newUomIsBase ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold" : "bg-white border-slate-200 text-slate-600"
                                        )}
                                    >
                                        <div className={cn("h-4 w-4 rounded border flex items-center justify-center transition-colors", newUomIsBase ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300")}>
                                            {newUomIsBase && <Check className="h-3 w-3 text-white" />}
                                        </div>
                                        Đơn vị Chuẩn
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Quy đổi</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            min={1}
                                            value={newUomRate}
                                            onChange={e => setNewUomRate(Number(e.target.value))}
                                            disabled={newUomIsBase}
                                            className="h-10 text-sm border-slate-200 disabled:bg-slate-50 flex-1"
                                        />
                                        <Button onClick={handleCreateUOM} disabled={!newUomName || loading} className="h-9 bg-slate-900 text-white hover:bg-slate-800 px-3">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[10px] border-b border-slate-100">
                                    <tr>
                                        <th className="p-4">Unit Name</th>
                                        <th className="p-4 text-center">Base Unit</th>
                                        <th className="p-4 text-right">Conversion</th>
                                        <th className="p-4 w-20"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {uoms.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-slate-400 italic">No units registered in this group</td>
                                        </tr>
                                    )}
                                    {uoms.map((u) => {
                                        const isEditing = editingUomId === u.id;
                                        return (
                                            <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4 align-top">
                                                    {isEditing ? (
                                                        <Input
                                                            value={editForm.name}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                            className="h-9 text-sm"
                                                        />
                                                    ) : (
                                                        <div className="font-bold text-slate-700">{u.name}</div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center align-top">
                                                    <div className="flex justify-center">
                                                        {u.isBaseUnit ? (
                                                            <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-200">YES</div>
                                                        ) : (
                                                            <div className="text-slate-300 text-[10px] font-bold">NO</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right align-top">
                                                    {isEditing ? (
                                                        <div className="flex items-center justify-end gap-2 text-xs">
                                                            <span className="text-slate-400">1 {u.name} =</span>
                                                            <Input
                                                                type="number"
                                                                value={editForm.conversionRate}
                                                                onChange={(e) => setEditForm(prev => ({ ...prev, conversionRate: Number(e.target.value) }))}
                                                                disabled={editForm.isBaseUnit}
                                                                className="h-9 w-20 text-right"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 font-medium font-mono">
                                                            <Scale className="h-3 w-3 text-slate-300" />
                                                            {u.conversionRate}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 align-top">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {isEditing ? (
                                                            <>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 shadow-sm" onClick={() => saveEditing(u.id)}>
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300 shadow-sm" onClick={cancelEditing}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 bg-amber-500 text-white rounded-md hover:bg-amber-600 shadow-sm transition-all" onClick={() => startEditing(u)}>
                                                                    <Edit2 className="h-3 w-3" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm transition-all" onClick={() => handleDeleteUOM(u.id)}>
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-xl min-h-[500px] border-dashed">
                            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                                <Scale className="h-8 w-8 text-slate-200" />
                            </div>
                            <h3 className="text-slate-900 font-bold">Chưa chọn nhóm</h3>
                            <p className="text-sm">Chọn hoặc tạo một Nhóm Đơn vị ở bên trái để bắt đầu thiết lập.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


