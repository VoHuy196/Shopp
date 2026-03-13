export type AdjustmentReason = 'STOCK_TAKE' | 'DAMAGED' | 'EXPIRED' | 'OTHER';

export interface AdjustmentItem {
    id: string;
    productId: string;
    variantId: string;
    sku: string;
    productName: string;
    systemQuantity: number;
    actualQuantity: number;
    difference: number; // actual - system
}

export interface StockAdjustment {
    id: string;
    code: string;
    reason: AdjustmentReason;
    note?: string;
    items: AdjustmentItem[];
    adjustedBy: string;
    adjustmentDate: string;
    createdAt: string;
}

export interface CreateAdjustmentInput {
    reason: AdjustmentReason;
    note?: string;
    items: {
        productId: string;
        variantId: string;
        sku: string;
        productName: string;
        systemQuantity: number;
        actualQuantity: number;
    }[];
}

export interface Warehouse {
    id: string;
    name: string;
    address: string;
    isMain: boolean;
}

export interface Batch {
    id: string;
    batchCode: string; // Mã lô
    expiryDate: string; // Hạn sử dụng
    manufacturingDate?: string;
}

export interface StockLevel {
    productId: string;
    warehouseId: string;
    quantity: number;
    batchId?: string; // Nếu quản lý theo lô
}

// Mở rộng InventoryTransaction để hỗ trợ chuyển kho
export interface InventoryTransaction {
    id: string;
    productId: string;
    type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT' | 'TRANSFER'; // Thêm TRANSFER
    quantity: number;
    referenceId?: string; // Mã phiếu nhập/xuất/chuyển
    date: string;
    warehouseId: string; // Kho thực hiện
    toWarehouseId?: string; // Kho đích (nếu là Transfer)
    batchId?: string;
    reason?: string;
}