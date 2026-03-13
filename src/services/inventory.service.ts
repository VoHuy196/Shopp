import { InventoryTransaction, StockLevel, Warehouse } from "@/types/inventory";
import { ProductService } from "./product.service"; // Cần import để đồng bộ dữ liệu cũ

const STORAGE_KEY_TRANSACTIONS = "wms_transactions";
const STORAGE_KEY_STOCK = "wms_stock_levels"; 
const STORAGE_KEY_WAREHOUSES = "wms_warehouses";

const INITIAL_WAREHOUSES: Warehouse[] = [
    { id: 'wh_main', name: 'Kho Tổng (HCM)', address: 'Q. Tân Bình, TP.HCM', isMain: true },
    { id: 'wh_hn', name: 'Kho Chi Nhánh (Hà Nội)', address: 'Q. Cầu Giấy, Hà Nội', isMain: false },
];

export const InventoryService = {
    // --- Warehouse Management ---
    getWarehouses: async (): Promise<Warehouse[]> => {
        const data = localStorage.getItem(STORAGE_KEY_WAREHOUSES);
        if (!data) {
            localStorage.setItem(STORAGE_KEY_WAREHOUSES, JSON.stringify(INITIAL_WAREHOUSES));
            return INITIAL_WAREHOUSES;
        }
        return JSON.parse(data);
    },

    // --- Stock Management ---
    getStockByLocation: async (productId: string, warehouseId: string): Promise<number> => {
        const stocks: StockLevel[] = JSON.parse(localStorage.getItem(STORAGE_KEY_STOCK) || "[]");
        return stocks
            .filter(s => s.productId === productId && s.warehouseId === warehouseId)
            .reduce((sum, item) => sum + item.quantity, 0);
    },

    transferStock: async (
        productId: string, 
        fromWarehouseId: string, 
        toWarehouseId: string, 
        quantity: number,
        reason: string
    ): Promise<void> => {
        let stocks: StockLevel[] = JSON.parse(localStorage.getItem(STORAGE_KEY_STOCK) || "[]");
        const transactions: InventoryTransaction[] = JSON.parse(localStorage.getItem(STORAGE_KEY_TRANSACTIONS) || "[]");

        // --- BƯỚC FIX LỖI: LOGIC ĐỒNG BỘ DỮ LIỆU CŨ ---
        // 1. Tính tổng tồn kho hiện có trong hệ thống Đa kho (WMS)
        const currentWmsTotal = stocks
            .filter(s => s.productId === productId && s.warehouseId === fromWarehouseId)
            .reduce((sum, s) => sum + s.quantity, 0);

        // 2. Nếu WMS = 0 nhưng ProductService (dữ liệu cũ) > 0 -> Coi như toàn bộ hàng cũ đang ở Kho Nguồn
        if (currentWmsTotal < quantity) {
            const product = await ProductService.getById(productId);
            // Tính tổng tồn kho của sản phẩm từ hệ thống cũ
            const oldSystemStock = product?.variants?.reduce((sum, v) => sum + (v.quantity || 0), 0) || 0;

            if (oldSystemStock >= quantity) {
                // Tự động khởi tạo tồn kho cho Kho Nguồn dựa trên dữ liệu cũ
                console.log("Auto-syncing stock from Legacy System to Warehouse...");
                stocks.push({
                    productId,
                    warehouseId: fromWarehouseId,
                    quantity: oldSystemStock, // Gán toàn bộ tồn cũ vào kho này
                    batchId: 'LEGACY_BATCH'
                });
            }
        }
        // ----------------------------------------------

        // 3. Tìm các lô hàng có thể trừ (FIFO)
        const sourceStockIndices = stocks
            .map((s, idx) => ({ ...s, idx }))
            .filter(s => s.productId === productId && s.warehouseId === fromWarehouseId && s.quantity > 0);

        const totalSource = sourceStockIndices.reduce((sum, s) => sum + s.quantity, 0);
        
        if (totalSource < quantity) {
            throw new Error(`Tồn kho nguồn không đủ! (Có: ${totalSource}, Cần: ${quantity})`);
        }

        // 4. Thực hiện trừ kho nguồn
        let remainingToTransfer = quantity;
        
        for (const item of sourceStockIndices) {
            if (remainingToTransfer <= 0) break;
            
            const deduct = Math.min(item.quantity, remainingToTransfer);
            stocks[item.idx].quantity -= deduct;
            remainingToTransfer -= deduct;

            // 5. Cộng kho đích
            const destIndex = stocks.findIndex(s => 
                s.productId === productId && 
                s.warehouseId === toWarehouseId && 
                s.batchId === item.batchId
            );

            if (destIndex >= 0) {
                stocks[destIndex].quantity += deduct;
            } else {
                stocks.push({
                    productId,
                    warehouseId: toWarehouseId,
                    quantity: deduct,
                    batchId: item.batchId
                });
            }
        }

        // 6. Lưu lịch sử
        const newTrans: InventoryTransaction = {
            id: crypto.randomUUID(),
            productId,
            type: 'TRANSFER',
            quantity,
            date: new Date().toISOString(),
            warehouseId: fromWarehouseId,
            toWarehouseId: toWarehouseId,
            reason
        };
        transactions.unshift(newTrans);

        localStorage.setItem(STORAGE_KEY_STOCK, JSON.stringify(stocks));
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    },
};