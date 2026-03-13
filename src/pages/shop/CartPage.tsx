import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui';
import { useNavigate } from 'react-router-dom';

export const CartPage = () => {
    const { cartItems, removeFromCart, clearCart, cartTotal, cartCount, updateQuantity } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('Giỏ hàng rỗng.');
            return;
        }
        // Simple mock checkout
        alert(`Thanh toán thành công: ${cartTotal.toLocaleString()} VND`);
        clearCart();
        navigate('/');
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Giỏ hàng ({cartCount})</h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate('/')}>Quay lại cửa hàng</Button>
                </div>
            </div>

            {cartItems.length === 0 ? (
                <div className="text-center text-slate-500 py-16 rounded-lg border border-dashed">Giỏ hàng đang trống.</div>
            ) : (
                <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    <div className="divide-y">
                        {cartItems.map(item => (
                            <div key={item.variantId} className="flex items-center justify-between p-4">
                                <div>
                                    <div className="font-medium">{item.productName}</div>
                                    <div className="text-sm text-slate-500">SKU: {item.sku}</div>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="font-semibold">{(item.price).toLocaleString()} VND</div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="outline" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>-</Button>
                                            <div className="text-sm">{item.quantity}</div>
                                            <Button size="sm" variant="outline" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>+</Button>
                                        </div>
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => removeFromCart(item.variantId)}>Xóa</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-slate-500">Tổng cộng</div>
                            <div className="text-xl font-bold">{cartTotal.toLocaleString()} VND</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={() => clearCart()}>Xóa hết</Button>
                            <Button onClick={handleCheckout} className="bg-indigo-600 hover:bg-indigo-700 text-white">Thanh toán</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
