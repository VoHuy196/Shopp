import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OutboundService, ProductService } from '@/services';
import type { Product, ProductVariant } from '@/types';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { ArrowLeft, ShoppingCart, Search, CreditCard } from 'lucide-react';

interface CartItem {
    productId: string;
    variantId: string;
    productName: string;
    sku: string;
    price: number;
    quantity: number;
}

export const RetailPOS = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const data = await ProductService.getAll();
            setProducts(data);
        };
        loadData();
    }, []);

    const addToCart = (product: Product, variant: ProductVariant) => {
        if (variant.quantity <= 0) {
            alert('Sản phẩm đã hết hàng!');
            return;
        }

        const existing = cart.find(c => c.variantId === variant.id);
        if (existing) {
            if (existing.quantity >= variant.quantity) {
                alert('Không đủ tồn kho!');
                return;
            }
            setCart(cart.map(c => c.variantId === variant.id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, {
                productId: product.id,
                variantId: variant.id,
                productName: product.name,
                sku: variant.sku,
                price: variant.salePrice || variant.price,
                quantity: 1
            }]);
        }
    };

    const updateQuantity = (index: number, change: number) => {
        const newCart = [...cart];
        const item = newCart[index];
        const newQty = item.quantity + change;

        if (newQty > 0) {
            // Check stock logic could be added here, simplified for now
            item.quantity = newQty;
            setCart(newCart);
        } else {
            newCart.splice(index, 1);
            setCart(newCart);
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!confirm('Xác nhận thanh toán và xuất kho?')) return;

        setProcessing(true);
        try {
            await OutboundService.create({
                type: 'RETAIL',
                items: cart.map(c => ({
                    productId: c.productId,
                    variantId: c.variantId,
                    sku: c.sku,
                    productName: c.productName,
                    unitPrice: c.price,
                    quantity: c.quantity
                }))
            });
            alert('Thanh toán thành công!');
            setCart([]); // Clear cart
            // Reload products to update stock
            const data = await ProductService.getAll();
            setProducts(data);
        } catch (error) {
            console.error(error);
            alert('Lỗi thanh toán');
        } finally {
            setProcessing(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.variants.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col md:flex-row gap-4">
            {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col gap-4 h-full">
                <div className="flex gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('..')} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm sản phẩm (Tên, SKU)..."
                            className="pl-8 bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                    {filteredProducts.map(product => (
                        product.variants.map(variant => (
                            <div
                                key={variant.id}
                                className="group relative flex flex-col justify-between rounded-lg border bg-card p-4 hover:shadow-md cursor-pointer transition-all active:scale-95"
                                onClick={() => addToCart(product, variant)}
                            >
                                <div>
                                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                                    <div className="mt-2 text-xs text-muted-foreground bg-muted inline-block px-1.5 py-0.5 rounded">
                                        {variant.sku}
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between items-end">
                                    <div className="font-bold text-lg">{(variant.salePrice || variant.price).toLocaleString()}</div>
                                    <div className={`text-xs ${variant.quantity > 0 ? 'text-green-600' : 'text-red-500 font-bold'}`}>
                                        Kho: {variant.quantity}
                                    </div>
                                </div>
                            </div>
                        ))
                    ))}
                </div>
            </div>

            {/* Right: Cart */}
            <div className="w-full md:w-96 flex flex-col h-full bg-card border rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-muted/30">
                    <h2 className="font-bold flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" /> Giỏ hàng ({cart.reduce((s, c) => s + c.quantity, 0)})
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center text-muted-foreground mt-10">
                            Giỏ hàng trống
                        </div>
                    ) : cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-muted/20 p-2 rounded">
                            <div className="flex-1">
                                <div className="font-medium line-clamp-1">{item.productName}</div>
                                <div className="text-xs text-muted-foreground">{item.sku}</div>
                                <div className="font-medium text-sm text-primary">{item.price.toLocaleString()}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(idx, -1)}>-</Button>
                                <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                                <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(idx, 1)}>+</Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-muted/30 border-t space-y-4">
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>Tổng tiền:</span>
                        <span className="text-primary">{totalAmount.toLocaleString()}</span>
                    </div>
                    <Button className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" size="lg" disabled={cart.length === 0 || processing} onClick={handleCheckout}>
                        <CreditCard className="mr-2 h-5 w-5" /> Thanh Toán
                    </Button>
                </div>
            </div>
        </div>
    );
};


