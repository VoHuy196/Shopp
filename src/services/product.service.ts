import type { Product, CreateProductInput } from "../types/product";

import mockData from "../data/mock-data.json";

const STORAGE_KEY = "ims_products";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ProductService = {
    getAll: async (): Promise<Product[]> => {
        await delay(300); // Simulate network delay
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            // Seed mock data
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData.products));
            return mockData.products as Product[];
        }
        return JSON.parse(data);
    },

    getById: async (id: string): Promise<Product | undefined> => {
        await delay(200);
        const products = await ProductService.getAll();
        return products.find((p) => p.id === id);
    },

    create: async (input: CreateProductInput): Promise<Product> => {
        await delay(500);
        const products = await ProductService.getAll();

        const newProduct: Product = {
            id: crypto.randomUUID(),
            name: input.name,
            description: input.description,
            categoryId: input.categoryId,
            uomGroupId: input.uomGroupId,
            hasVariant: input.hasVariant,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            variants: input.variants.map((v) => ({
                ...v,
                id: crypto.randomUUID(),
                quantity: (v as any).quantity || 0, // preserve provided quantity or default 0
            })),
        };

        // If no variants provided but hasVariant is false, create a default variant (hidden logic usually, but here strict)
        // Or if !hasVariant, we might treat the product itself as having 1 variant under the hood for consistency
        if (!input.hasVariant && input.variants.length > 0) {
            // If user filled variant info but unchecked hasVariant, we take the first one
            // Ideally the UI handles this ensuring 1 variant exists
        }

        products.unshift(newProduct);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        return newProduct;
    },

    update: async (id: string, input: Partial<CreateProductInput>): Promise<Product> => {
        await delay(500);
        const products = await ProductService.getAll();
        const index = products.findIndex((p) => p.id === id);

        if (index === -1) throw new Error("Product not found");

        const existingProduct = products[index];

        // Logic to handle variant updates is complex (add/remove/update). 
        // For MVP, we might replace variants if provided, or handle specific variant updates.
        // Here assuming full update for simplicity or basic field update.

        const updatedProduct: Product = {
            ...existingProduct,
            ...input,
            updatedAt: new Date().toISOString(),
            variants: input.variants ? input.variants.map(v => ({
                ...v,
                id: (v as any).id || crypto.randomUUID(), // Keep ID if exists (from UI), else new
                quantity: (v as any).quantity || 0
            })) : existingProduct.variants
        };

        products[index] = updatedProduct;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        return updatedProduct;
    },

    delete: async (id: string): Promise<void> => {
        await delay(300);
        const products = await ProductService.getAll();
        const filtered = products.filter((p) => p.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    },

    updateStock: async (productId: string, variantId: string, quantityChange: number): Promise<void> => {
        const products = await ProductService.getAll();
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const variant = product.variants.find(v => v.id === variantId);
        if (variant) {
            variant.quantity = (variant.quantity || 0) + quantityChange;
        }

        // Save back
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
};
