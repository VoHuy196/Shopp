export type OutboundType = 'WHOLESALE' | 'RETAIL';
export type OutboundStatus = 'DRAFT' | 'COMPLETED' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT' | 'MULTIPLE';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

export interface PaymentItem {
    method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT';
    amount: number;
    reference?: string;
}

export interface OutboundOrderItem {
    id: string;
    productId: string;
    variantId: string;
    sku: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalAmount: number;
    unitId?: string;
    unitName?: string;
    conversionRate?: number;
}

export interface OutboundOrder {
    id: string;
    code: string;
    type: OutboundType;
    customerName: string; // Retail: "Khách lẻ", Wholesale: Specific customer
    status: OutboundStatus;
    items: OutboundOrderItem[];
    note?: string;
    exportDate: string; // ISO Date
    createdBy: string; // This will store the performer
    createdAt: string;
    updatedAt: string;

    // Payment Fields
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    payments: PaymentItem[];
    totalAmount: number;
}

export interface CreateOutboundInput {
    type: OutboundType;
    customerName?: string;
    note?: string;
    exportDate?: string;
    performer?: string;

    // Payment Fields
    paymentMethod?: PaymentMethod;
    payments?: PaymentItem[];

    items: {
        productId: string;
        variantId: string;
        sku: string;
        productName: string;
        unitPrice: number;
        quantity: number;
        uomId?: string;
        uomName?: string;
        conversionRate?: number;
    }[];
}

