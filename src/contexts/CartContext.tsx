import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Product, ProductVariant } from '@/types';

// Định nghĩa kiểu dữ liệu cho sản phẩm trong giỏ
export interface CartItem {
    productId: string;
    variantId: string;
    productName: string;
    sku: string;
    price: number;
    quantity: number;
    image?: string; 
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, variant?: ProductVariant) => void;
    removeFromCart: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const addToCart = (product: Product, variant?: ProductVariant) => {
        // Nếu không truyền variant, thử lấy variant đầu tiên 
        const targetVariant = variant || product.variants[0];
        
        if (!targetVariant) return;

        setCartItems(prev => {
            const existing = prev.find(item => item.variantId === targetVariant.id);
            if (existing) {
                return prev.map(item => 
                    item.variantId === targetVariant.id 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                variantId: targetVariant.id,
                productName: product.name,
                sku: targetVariant.sku,
                price: targetVariant.salePrice || targetVariant.price,
                quantity: 1
            }];
        });
    };

    const removeFromCart = (variantId: string) => {
        setCartItems(prev => prev.filter(item => item.variantId !== variantId));
    };

    const updateQuantity = (variantId: string, quantity: number) => {
        setCartItems(prev => {
            const updated = prev.map(item => item.variantId === variantId ? { ...item, quantity } : item);
            // Remove items with quantity <= 0
            return updated.filter(i => i.quantity > 0);
        });
    };

    const clearCart = () => setCartItems([]);

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};