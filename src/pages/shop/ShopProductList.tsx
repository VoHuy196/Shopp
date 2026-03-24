import { useEffect, useState } from 'react';
import { ProductService } from '@/services';
import { useProducts } from '@/hooks/queries/useProducts';
import type { Product } from '@/types';
import { Button, Card, CardContent, CardFooter, Input } from '@/components/ui';
import { useCartStore } from '@/stores';

import { ShoppingCart, Search, Filter } from 'lucide-react';

export const ShopProductList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const addToCart = useCartStore.getState().addToCart;

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadProducts = async () => {
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
        loadProducts();
    }, []);

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900">Tất cả sản phẩm</h1>
                    <p className="text-slate-500 text-sm">Tìm thấy {filteredProducts.length} sản phẩm</p>
                </div>
                
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Tìm kiếm sản phẩm..." 
                            className="pl-9 bg-slate-50 border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4 text-slate-600" />
                    </Button>
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="text-center py-20 text-slate-400">Đang tải sản phẩm...</div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                    Không tìm thấy sản phẩm nào phù hợp.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => {
                        // Lấy giá từ biến thể đầu tiên để hiển thị (Logic đơn giản)
                        const firstVariant = product.variants?.[0];
                        const originalPrice = firstVariant?.price ?? 0;
                        const salePrice = firstVariant?.salePrice ?? null;
                        const price = (salePrice !== null && salePrice < originalPrice) ? salePrice : originalPrice;
                        const hasDiscount = salePrice !== null && originalPrice > 0 && salePrice < originalPrice;
                        const discountPercent = hasDiscount && originalPrice > 0 ? Math.round((1 - (salePrice! / originalPrice)) * 100) : 0;
                        const hasStock = product.variants?.some(v => v.quantity > 0) ?? false;

                        return (
                            <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200 flex flex-col h-full">
                                {/* Giả lập ảnh sản phẩm bằng div màu */}
                                <div className="h-56 bg-slate-100 flex items-center justify-center relative overflow-hidden group-hover:bg-indigo-50/30 transition-colors">
                                    {hasDiscount && (
                                        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md z-10">
                                            -{discountPercent}%
                                        </div>
                                    )}
                                    <div className="text-6xl transition-transform duration-500 group-hover:scale-110 select-none">📦</div>
                                    
                                    {!hasStock && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                            <span className="bg-slate-900 text-white px-3 py-1 text-xs font-bold rounded">HẾT HÀNG</span>
                                        </div>
                                    )}
                                </div>
                                
                                <CardContent className="p-5 flex-1 flex flex-col">
                                    <div className="mb-2">
                                        <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">New Arrival</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors" title={product.name}>
                                        {product.name}
                                    </h3>
                                    <div className="mt-auto pt-2 flex items-baseline gap-2">
                                        <span className="text-lg font-bold text-slate-900">
                                            {price.toLocaleString()} đ
                                        </span>
                                        {hasDiscount && originalPrice > 0 && (
                                            <span className="text-xs text-slate-400 line-through opacity-80">
                                                {originalPrice.toLocaleString()} đ
                                            </span>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="p-5 pt-0">
                                    <Button 
                                        className="w-full bg-slate-900 hover:bg-indigo-600 transition-colors shadow-none"
                                        disabled={!hasStock}
                                        onClick={() => addToCart(product)}
                                    >
                                        <ShoppingCart className="mr-2 h-4 w-4" /> 
                                        {hasStock ? 'Thêm vào giỏ' : 'Hết hàng'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};