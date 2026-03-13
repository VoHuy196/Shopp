import { useEffect, useState, Fragment } from 'react';
import { ProductService, CategoryService } from '@/services';
import type { Product, Category } from '@/types';
import { Button, Input } from '@/components/ui';
import { Plus, ChevronDown, ChevronRight, Edit2, Trash2, AlertTriangle, Package, Layers, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const ProductList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadInitData = async () => {
            setLoading(true);
            try {
                const [prodData, catData] = await Promise.all([
                    ProductService.getAll(),
                    CategoryService.getAll()
                ]);
                setProducts(prodData);
                setCategories(catData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadInitData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await ProductService.getAll();
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to check low stock
    const isLowStock = (product: Product, variantQty: number) => {
        if (!product.categoryId) return false;
        const category = categories.find(c => c.id === product.categoryId);
        if (!category) return false;
        return variantQty <= category.minStockThreshold;
    };

    const toggleRow = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            await ProductService.delete(id);
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
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Danh sách sản phẩm</h2>
                    <p className="text-muted-foreground text-sm">Quản lý danh mục hàng hóa, tồn kho và biến thể.</p>
                </div>

                <Link to="new">
                    <Button className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold tracking-tight px-4 h-9 text-xs shadow-lg shadow-indigo-200">
                        <Plus className="mr-2 h-4 w-4" /> THÊM SẢN PHẨM
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
                    <Input placeholder="Search" className="h-9 shadow-none border-slate-200" />
                </div>
                <Button variant="ghost" className="text-slate-500 font-medium h-9 text-xs">Reset</Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs w-[40%] pb-6">Product Information</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs w-[20%] pb-6">Inventory</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-tight text-xs pb-6">Pricing & Details</th>
                            <th className="p-4 w-10 pb-6"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-muted-foreground italic bg-slate-50/20">
                                    Chưa có sản phẩm nào.
                                </td>
                            </tr>
                        )}
                        {products.map((product) => {
                            const totalQty = product.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
                            const hasLowStock = product.variants.some(v => isLowStock(product, v.quantity || 0));
                            const category = categories.find(c => c.id === product.categoryId);

                            return (
                                <Fragment key={product.id}>
                                    <tr className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 align-top">
                                            <div className="flex gap-4">
                                                <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0">
                                                    <Package className="h-6 w-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                                        {product.name}
                                                        {product.hasVariant && (
                                                            <div
                                                                onClick={(e) => toggleRow(product.id, e)}
                                                                className="cursor-pointer p-0.5 hover:bg-slate-200 rounded transition-colors"
                                                            >
                                                                {expandedRows.has(product.id) ? (
                                                                    <ChevronDown className="h-3 w-3 text-slate-400" />
                                                                ) : (
                                                                    <ChevronRight className="h-3 w-3 text-slate-400" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-slate-500 text-xs flex items-center gap-1">
                                                        <Layers className="h-3 w-3" />
                                                        {category?.name || 'Uncategorized'}
                                                    </div>
                                                    {!product.hasVariant && (
                                                        <div className="text-slate-400 text-xs font-mono">{product.variants[0]?.sku}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="space-y-1">
                                                <div className={cn(
                                                    "font-bold text-sm",
                                                    hasLowStock ? "text-red-500" : "text-slate-600"
                                                )}>
                                                    {totalQty.toLocaleString()} <span className="text-[10px] font-normal opacity-70">pcs</span>
                                                </div>
                                                {hasLowStock && (
                                                    <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase tracking-wider">
                                                        <AlertTriangle className="h-3 w-3" /> Low Stock
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="space-y-1">
                                                <div className="text-emerald-600 font-bold text-sm">
                                                    {product.variants.length > 1
                                                        ? `${Math.min(...product.variants.map(v => v.salePrice)).toLocaleString()} - ${Math.max(...product.variants.map(v => v.salePrice)).toLocaleString()}`
                                                        : product.variants[0]?.salePrice?.toLocaleString() || '0'
                                                    } <span className="text-[10px] font-normal opacity-70">đ</span>
                                                </div>
                                                <div className="text-slate-400 text-xs italic flex items-center gap-1">
                                                    <Info className="h-3 w-3" />
                                                    {product.variants.length} variations
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="flex items-center justify-end gap-1 px-4">
                                                <Link to={`/admin/products/${product.id}/edit`}> 
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-amber-500 text-white rounded-md hover:bg-amber-600 shadow-sm transition-all">
                                                        <Edit2 className="h-3 w-3" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm transition-all" onClick={() => handleDelete(product.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedRows.has(product.id) && (
                                        <tr className="bg-slate-50/50">
                                            <td colSpan={4} className="p-0">
                                                <div className="px-16 py-4 border-l-4 border-slate-200">
                                                    <table className="w-full text-xs text-left">
                                                        <thead className="text-slate-400 font-bold uppercase tracking-widest text-[9px] border-b border-slate-100">
                                                            <tr>
                                                                <th className="pb-2">Variant SKU</th>
                                                                <th className="pb-2">Barcode</th>
                                                                <th className="pb-2 text-right">In Price</th>
                                                                <th className="pb-2 text-right">Sale Price</th>
                                                                <th className="pb-2 text-right">Stock</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-50">
                                                            {product.variants.map(v => (
                                                                <tr key={v.id} className="hover:bg-white transition-colors">
                                                                    <td className="py-2 text-slate-700 font-medium">{v.sku}</td>
                                                                    <td className="py-2 text-slate-500">{v.barcode || '-'}</td>
                                                                    <td className="py-2 text-right text-slate-500">{v.price?.toLocaleString()} đ</td>
                                                                    <td className="py-2 text-right text-slate-700 font-bold">{v.salePrice?.toLocaleString()} đ</td>
                                                                    <td className="py-2 text-right">
                                                                        <span className={cn(
                                                                            "font-bold",
                                                                            isLowStock(product, v.quantity || 0) ? "text-red-500" : "text-emerald-600"
                                                                        )}>
                                                                            {v.quantity?.toLocaleString() || 0}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


