import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, ProductVariant } from '@/types/product';

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  cartItems: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

const useCartStoreBase = create(
  persist<CartState>(
    (set, get) => ({
      cartItems: [],
      addToCart: (product: Product, variant?: ProductVariant) => {
        const targetVariant = variant || product.variants[0];
        if (!targetVariant) return;
        
        set((state) => {
          const existing = state.cartItems.find(item => item.variantId === targetVariant.id);
          if (existing) {
            return {
              cartItems: state.cartItems.map(item => 
                item.variantId === targetVariant.id 
                  ? { ...item, quantity: item.quantity + 1 } 
                  : item
              )
            };
          }
          return {
            cartItems: [...state.cartItems, {
              productId: product.id,
              variantId: targetVariant.id,
              productName: product.name,
              sku: targetVariant.sku,
              price: targetVariant.salePrice || targetVariant.price || 0,
              quantity: 1
            }]
          };
        });
      },
      removeFromCart: (variantId: string) => {
        set((state) => ({
          cartItems: state.cartItems.filter(item => item.variantId !== variantId)
        }));
      },
      updateQuantity: (variantId: string, quantity: number) => {
        set((state) => ({
          cartItems: state.cartItems
            .map(item => item.variantId === variantId ? { ...item, quantity } : item)
            .filter(i => i.quantity > 0)
        }));
      },
      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'wms-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Computed selectors (use in components)
export const useCartTotal = () => useCartStoreBase((state) => 
  state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
);

export const useCartCount = () => useCartStoreBase((state) => 
  state.cartItems.reduce((count, item) => count + item.quantity, 0)
);

export const useCartStore = useCartStoreBase;

