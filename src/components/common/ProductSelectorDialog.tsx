import { useState, useEffect } from 'react';
import { ProductService } from '@/shared-bridge';
import { CategoryService } from '@/shared-bridge';
import type { Product, ProductVariant } from '@/shared-bridge';
import type { Category } from '@/shared-bridge';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui';
import { Search } from 'lucide-react';

interface ProductSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (product: Product, variant: ProductVariant) => void;
    showQuantity?: boolean; // If true, show stock quantity (for Outbound)
}

export const ProductSelectorDialog = ({ open, onOpenChange, onSelect, showQuantity = false }: ProductSelectorProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        if (open) {
            loadData();
        }
    }, [open]);

    const loadData = async () => {
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

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.variants?.some(v => v.sku?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory ? p.categoryId === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">

                    <DialogHeader>
                        <DialogTitle>Chọn sản phẩm</DialogTitle>
                        <DialogDescription>Tìm và chọn sản phẩm hoặc biến thể từ danh sách. Sử dụng tìm kiếm và bộ lọc để dễ dàng chọn.</DialogDescription>

                    </DialogHeader>


                <div className="space-y-4 py-2">
                    {/* Filters */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo Tên hoặc SKU..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-[200px]"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            title="Lọc theo nhóm hàng"
                            aria-label="Lọc theo nhóm hàng"
                        >
                            <option value="">-- Tất cả nhóm hàng --</option>
                                title="Lọc theo nhóm hàng"

                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Product List */}
                    <div className="border rounded-md flex-1 overflow-auto h-[50vh]">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">Đang tải...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">Không tìm thấy sản phẩm nào.</div>
                        ) : (
                            <div className="divide-y">
                                {filteredProducts.map(p => (
                                    <div key={p.id} className="p-3 hover:bg-muted/30">
                                        <div className="font-semibold text-sm mb-2 text-primary">{p.name}</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                                            {p.variants?.map(v => {
                                                const isDisabled = showQuantity && v.quantity <= 0;
                                                return (
                                                    <div
                                                        key={v.id}
                                                        className={`flex items-center justify-between p-2 rounded border bg-card text-sm cursor-pointer transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed bg-muted' : 'hover:bg-accent hover:border-primary/50'}`}
                                                        onClick={() => !isDisabled && onSelect(p, v)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{v.sku}</div>
                                                            {p.hasVariant && <div className="text-muted-foreground text-xs">Biến thể</div>}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {(showQuantity) && (
                                                                <span className={`text-xs font-medium ${v.quantity < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                                                    Tồn: {v.quantity}
                                                                </span>
                                                            )}
                                                            <span className="font-medium">
                                                                {/* Display generic price based on context? Usually selector shows base info */}
                                                                {(v.salePrice || v.price)?.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="sm:justify-between">
                    <div className="text-xs text-muted-foreground pt-2">
                        Hiển thị <b>{filteredProducts.reduce((c, p) => c + (p.variants?.length || 0), 0)}</b> biến thể sản phẩm.
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


