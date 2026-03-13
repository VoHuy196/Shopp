export interface ProductVariant {
    id: string;
    sku: string;
    price: number; // Import price
    salePrice: number; // Selling price
    discountPercent?: number;
    barcode?: string;
    quantity: number;
    attributeValues?: {
        attributeId: string;
        valueId: string;
        attributeName: string;
        valueName: string;
    }[];
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    categoryId?: string;
    unitGroupId?: string; // Link to UOM Group
    hasVariant: boolean;
    variants: ProductVariant[];
    createdAt: string;
    updatedAt: string;
    barcode?: string;// Mã vạch
    minStockLevel?: number; // Định mưc tồn kho tối thiểu
    manageByBatch?: boolean; // Quản lý theo lô
}

export interface CreateProductInput {
    name: string;
    description?: string;
    categoryId?: string;
    unitGroupId?: string;
    hasVariant: boolean;
    variants: Omit<ProductVariant, 'id' | 'quantity'>[];
}
