import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductService, CategoryService, UnitGroupService, AttributeService } from '@/services';
import { Button, Input, Label, Switch } from '@/components/ui';
import { Plus, Trash2, ArrowLeft, Save, Settings2, Layers, Check, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreateProductInput, Category, UnitGroup, Attribute } from '@/types';

// Utility to create a blank variant
const createEmptyVariant = (): any => ({
    sku: '',
    price: 0,
    salePrice: 0,
    discountPercent: 0,
    barcode: '',
    quantity: 0,
});

export const ProductForm = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const { id } = useParams();
    const isEdit = !!id;

    // Form State
    const [name, setName] = useState('');

    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [unitGroupId, setUnitGroupId] = useState('');
    const [unitGroups, setUnitGroups] = useState<UnitGroup[]>([]);
    const [hasVariant, setHasVariant] = useState(false);

    // Variants State
    const [variants, setVariants] = useState<any[]>([createEmptyVariant()]);

    // Attribute State
    const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>([]);
    const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        const loadInitialData = async () => {
            const [catData, unitData, attrData] = await Promise.all([
                CategoryService.getAll(),
                UnitGroupService.getGroups(),
                AttributeService.getAll()
            ]);
            setCategories(catData);
            setUnitGroups(unitData);
            setAvailableAttributes(attrData);
        };
        loadInitialData();
        // If editing, load product
        if (isEdit) {
            (async () => {
                try {
                    const p = await ProductService.getById(id!);
                    if (p) {
                        setName(p.name || '');
                        setDescription(p.description || '');
                        setCategoryId((p as any).categoryId || '');
                        setUnitGroupId((p as any).unitGroupId || (p as any).uomGroupId || '');
                        setHasVariant(!!p.hasVariant);
                        setVariants(p.variants.map(v => {
                            const orig = v.price ?? 0;
                            const sp = (v.salePrice ?? orig);
                            const discount = orig > 0 ? Math.round((1 - (sp / orig)) * 100) : 0;
                            return {
                                id: v.id,
                                sku: v.sku || '',
                                price: orig,
                                salePrice: sp,
                                discountPercent: discount,
                                barcode: v.barcode || '',
                                quantity: v.quantity || 0,
                                attributeValues: v.attributeValues || []
                            };
                        }));
                    }
                } catch (err) {
                    console.error(err);
                    alert('Không tìm thấy sản phẩm');
                    navigate('/admin/products');
                }
            })();
        }
    }, []);

    const toggleAttributeValue = (attrId: string, valueId: string) => {
        setSelectedAttributes(prev => {
            const currentValues = prev[attrId] || [];
            if (currentValues.includes(valueId)) {
                return { ...prev, [attrId]: currentValues.filter(id => id !== valueId) };
            } else {
                return { ...prev, [attrId]: [...currentValues, valueId] };
            }
        });
    };

    const handleGenerateVariants = () => {
        const activeAttrs = Object.entries(selectedAttributes).filter(([_, values]) => values.length > 0);
        if (activeAttrs.length === 0) {
            alert('Vui lòng chọn ít nhất một giá trị thuộc tính');
            return;
        }

        let combinations: any[][] = [[]];
        activeAttrs.forEach(([attrId, valueIds]) => {
            const attr = availableAttributes.find(a => a.id === attrId);
            const nextCombos: any[][] = [];
            combinations.forEach(combo => {
                valueIds.forEach(valId => {
                    const val = attr?.values.find(v => v.id === valId);
                    nextCombos.push([...combo, {
                        attributeId: attrId,
                        valueId: valId,
                        attributeName: attr?.name,
                        valueName: val?.value
                    }]);
                });
            });
            combinations = nextCombos;
        });

        const newVariants = combinations.map(combo => {
            const attrText = combo.map(c => c.valueName).join('-');
            const skuBase = name.trim() ? name.toUpperCase().replace(/\s+/g, '-') : 'SKU';
            return {
                ...createEmptyVariant(),
                sku: `${skuBase}-${attrText.toUpperCase().replace(/\s+/g, '-')}`,
                attributeValues: combo
            };
        });

        setVariants(newVariants);
    };

    const handleAddVariant = () => {
        setVariants([...variants, createEmptyVariant()]);
    };

    const handleRemoveVariant = (index: number) => {
        if (variants.length > 1) {
            const newVariants = [...variants];
            newVariants.splice(index, 1);
            setVariants(newVariants);
        }
    };

    const handleVariantChange = (index: number, field: string, value: any) => {
        const newVariants = [...variants];
        const existing = { ...newVariants[index] };

        if (field === 'discountPercent') {
            const discount = Number(value) || 0;
            existing.discountPercent = discount;
            existing.salePrice = Math.max(0, Math.round((existing.price || 0) * (1 - discount / 100)));
        } else if (field === 'price') {
            const priceVal = Number(value) || 0;
            existing.price = priceVal;
            // if user already set a discount percent, keep it in sync
            if (existing.discountPercent && existing.discountPercent > 0) {
                existing.salePrice = Math.max(0, Math.round(priceVal * (1 - (existing.discountPercent / 100))));
            }
        } else if (field === 'salePrice') {
            const sp = Number(value) || 0;
            existing.salePrice = sp;
            // recalc discount percent based on original price
            if ((existing.price ?? 0) > 0) {
                existing.discountPercent = Math.round((1 - (sp / (existing.price || 1))) * 100);
                if (existing.discountPercent < 0) existing.discountPercent = 0;
            }
        } else {
            existing[field] = value;
        }

        newVariants[index] = existing;
        setVariants(newVariants);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const productData: CreateProductInput = {
                name,
                description,
                categoryId,
                unitGroupId,
                hasVariant,
                variants: hasVariant ? variants : [{
                    sku: variants[0].sku,
                    price: variants[0].price,
                    salePrice: variants[0].salePrice ?? variants[0].price ?? 0,
                    quantity: variants[0].quantity || 0
                }]
            };

            if (isEdit) {
                await ProductService.update(id!, productData as any);
                navigate('/admin/products');
            } else {
                await ProductService.create(productData as any);
                navigate('/admin/products');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to save product');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 text-slate-800">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                    <p className="text-muted-foreground text-sm">Vui lòng điền thông tin bên dưới để {isEdit ? 'cập nhật' : 'thêm'} bản ghi.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/products')} className="rounded-full shadow-sm text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-12">
                {/* General Info */}
                <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-8 space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Tên sản phẩm *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="Nhập tên sản phẩm..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <textarea
                                    id="description"
                                    className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all resize-none"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Mô tả ngắn gọn về sản phẩm..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-slate-100">
                            <div className="space-y-2">
                                <Label htmlFor="category">Danh mục sản phẩm</Label>
                                <select
                                    id="category"
                                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all cursor-pointer"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    aria-label="Danh mục sản phẩm" // Added accessible name
                                    title="Danh mục sản phẩm" // Added title attribute
                                >
                                    <option value="">-- Chọn nhóm --</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit-group">Nhóm Đơn vị</Label>
                                <select
                                    id="unit-group"
                                    aria-label="Nhóm Đơn vị" // Added accessible name
                                    title="Nhóm Đơn vị" // Added title attribute
                                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all cursor-pointer"
                                    value={unitGroupId}
                                    onChange={(e) => setUnitGroupId(e.target.value)}
                                >
                                    <option value="">-- Chọn nhóm đơn vị --</option>
                                    {unitGroups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <Switch
                                id="has-variant"
                                checked={hasVariant}
                                onCheckedChange={setHasVariant}
                            />
                            <div className="space-y-1">
                                <Label htmlFor="has-variant" className="text-base">Sản phẩm có nhiều biến thể</Label>
                                <p className="text-xs text-muted-foreground">
                                    Kích hoạt nếu sản phẩm có nhiều màu sắc, kích thước hoặc thuộc tính khác nhau.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attributes Selection (Only if hasVariant) */}
                {hasVariant && (
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="p-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Settings2 className="h-5 w-5 text-indigo-600" />
                                        Thiết lập Thuộc tính & Biến thể
                                    </h3>
                                    <p className="text-xs text-muted-foreground">Chọn các thuộc tính và giá trị để hệ thống tự động tạo các biến thể sản phẩm.</p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleGenerateVariants}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 shadow-lg shadow-indigo-200"
                                >
                                    <RefreshCcw className="mr-2 h-5 w-5" /> TẠO BIẾN THỂ TỰ ĐỘNG
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {availableAttributes.map(attr => (
                                    <div key={attr.id} className="space-y-4 p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                            <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                            <span className="font-bold text-slate-700 text-sm">{attr.name}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {attr.values.map(val => (
                                                <div
                                                    key={val.id}
                                                    onClick={() => toggleAttributeValue(attr.id, val.id)}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border",
                                                        selectedAttributes[attr.id]?.includes(val.id)
                                                            ? "bg-indigo-600 text-white border-indigo-600"
                                                            : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                                                    )}
                                                >
                                                    {selectedAttributes[attr.id]?.includes(val.id) && <Check className="h-3 w-3" />}
                                                    {val.value}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Variants Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Layers className="h-5 w-5 text-emerald-600" />
                                Danh sách {hasVariant ? 'Biến thể' : 'Sản phẩm'}
                            </h3>
                            <p className="text-xs text-muted-foreground italic">Chi tiết cấu hình cho từng thuộc tính {hasVariant ? 'đã tạo' : 'sản phẩm'}</p>
                        </div>
                        {hasVariant && (
                            <Button type="button" variant="outline" size="sm" onClick={handleAddVariant} className="rounded-full shadow-sm text-indigo-600 border-indigo-200 hover:bg-indigo-50 transition-all font-bold h-10 px-5">
                                <Plus className="mr-2 h-5 w-5" /> THÊM THỦ CÔNG
                            </Button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {variants.map((variant, index) => (
                            <div key={index} className="bg-white border rounded-xl shadow-sm overflow-hidden relative group border-l-4 border-l-slate-200 hover:border-l-indigo-600 transition-all">
                                {hasVariant && (
                                    <div className="bg-slate-50 px-8 py-4 border-b flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="h-6 w-12 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">#{index + 1}</span>
                                            {variant.attributeValues && (
                                                <div className="flex gap-2">
                                                    {variant.attributeValues.map((av: any, i: number) => (
                                                        <span key={i} className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                                                            <span className="text-[10px] text-slate-400 mr-1 uppercase">{av.attributeName}:</span>
                                                            {av.valueName}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {variants.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 -mr-2"
                                                onClick={() => handleRemoveVariant(index)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" /> Xóa
                                            </Button>
                                        )}
                                    </div>
                                )}

                                <div className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Mã SKU *</Label>
                                            <Input
                                                value={variant.sku}
                                                onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                                required
                                                placeholder="VD: SKU-001"
                                                className="h-10 border-slate-200 font-mono text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Mã vạch (Barcode)</Label>
                                            <Input
                                                value={variant.barcode}
                                                onChange={(e) => handleVariantChange(index, 'barcode', e.target.value)}
                                                placeholder="Quét mã vạch..."
                                                className="h-10 border-slate-200 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Giá nhập</Label>
                                            <Input
                                                type="number"
                                                value={variant.price}
                                                onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))}
                                                min={0}
                                                className="h-10 border-slate-200 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Giá bán</Label>
                                            <Input
                                                type="number"
                                                value={variant.salePrice}
                                                onChange={(e) => handleVariantChange(index, 'salePrice', Number(e.target.value))}
                                                min={0}
                                                className="h-10 border-slate-200 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Giảm giá (%)</Label>
                                            <Input
                                                type="number"
                                                value={variant.discountPercent ?? 0}
                                                onChange={(e) => handleVariantChange(index, 'discountPercent', Number(e.target.value))}
                                                min={0}
                                                max={100}
                                                className="h-10 border-slate-200 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Số lượng</Label>
                                            <Input
                                                type="number"
                                                value={variant.quantity ?? 0}
                                                onChange={(e) => handleVariantChange(index, 'quantity', Number(e.target.value))}
                                                min={0}
                                                className="h-10 border-slate-200 text-sm"
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl p-8 flex items-center justify-between shadow-lg shadow-slate-200">
                    <div className="space-y-1">
                        <h4 className="font-bold text-lg">Xác nhận thông tin</h4>
                        <p className="text-slate-400 text-sm">Kiểm tra kỹ các thông tin trước khi lưu vào hệ thống</p>
                    </div>
                    <div className="flex gap-4">
                        <Button type="button" variant="ghost" onClick={() => navigate('/admin/products')} className="text-slate-300 hover:text-white hover:bg-slate-800">
                            Hủy bỏ
                        </Button>
                        <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 h-12 rounded-lg font-bold shadow-xl shadow-indigo-200">
                            {submitting ? 'Đang lưu...' : (
                                <>
                                    <Save className="mr-2 h-5 w-5" /> Lưu sản phẩm
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};




