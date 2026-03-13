export type InboundStatus = 'DRAFT' | 'COMPLETED' | 'CANCELLED';

export interface InboundOrderItem {
    id: string;
    productId: string;
    variantId: string;
    sku: string;
    productName: string; // Snapshot
    unitPrice: number;
    requestQuantity: number; // Số lượng chứng từ
    receivedQuantity: number; // Số lượng thực nhập
    totalAmount: number;
    unitId?: string;
    unitName?: string;
    conversionRate?: number;
}

export interface InboundOrder {
    id: string;
    code: string;
    supplierId: string;
    supplierName: string; // Snapshot
    status: InboundStatus;
    items: InboundOrderItem[];
    note?: string;
    receivedDate: string; // ISO Date
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateInboundInput {
    supplierId: string;
    supplierName: string;
    note?: string;
    receivedDate?: string;
    performer?: string;
    items: {
        productId: string;
        variantId: string;
        sku: string;
        productName: string;
        unitPrice: number;
        requestQuantity: number;
        receivedQuantity: number;
        uomId?: string;
        uomName?: string;
        conversionRate?: number;
    }[];
}
