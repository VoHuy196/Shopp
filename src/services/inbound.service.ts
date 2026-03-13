import type { InboundOrder, CreateInboundInput } from "../types/inbound";
import { ProductService } from "./product.service";

const STORAGE_KEY = "ims_inbounds";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const InboundService = {
    getAll: async (): Promise<InboundOrder[]> => {
        await delay(300);
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    getById: async (id: string): Promise<InboundOrder | undefined> => {
        await delay(200);
        const orders = await InboundService.getAll();
        return orders.find((o) => o.id === id);
    },

    create: async (input: CreateInboundInput): Promise<InboundOrder> => {
        await delay(500);
        const orders = await InboundService.getAll();

        // Auto generate Code "PN-YYMMDD-XXX"
        const today = new Date();
        const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
        const count = orders.filter(o => o.code.startsWith(`PN-${dateStr}`)).length + 1;
        const code = `PN-${dateStr}-${count.toString().padStart(3, '0')}`;

        const newOrder: InboundOrder = {
            id: crypto.randomUUID(),
            code,
            supplierId: input.supplierId,
            supplierName: input.supplierName,
            note: input.note,
            status: 'DRAFT', // Default to DRAFT
            items: input.items.map(item => ({
                id: crypto.randomUUID(),
                productId: item.productId,
                variantId: item.variantId,
                sku: item.sku,
                productName: item.productName,
                unitPrice: item.unitPrice,
                requestQuantity: item.requestQuantity,
                receivedQuantity: item.receivedQuantity,
                totalAmount: item.receivedQuantity * item.unitPrice,
                unitId: item.uomId,
                unitName: item.uomName,
                conversionRate: item.conversionRate || 1
            })),
            receivedDate: input.receivedDate || new Date().toISOString(),
            createdBy: input.performer || 'Admin', // This is now the "performer"
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // NOTE: Do NOT update stock here anymore. Wait for approval.

        orders.unshift(newOrder);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        return newOrder;
    },

    approve: async (id: string): Promise<void> => {
        await delay(300);
        const orders = await InboundService.getAll();
        const order = orders.find(o => o.id === id);
        if (!order) throw new Error("Order not found");
        if (order.status === 'COMPLETED') throw new Error("Order already completed");

        // Update Stock
        for (const item of order.items) {
            const qty = item.receivedQuantity * (item.conversionRate || 1);
            await ProductService.updateStock(item.productId, item.variantId, qty);
        }

        order.status = 'COMPLETED';
        order.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
,

    // Update Inbound Order (DRAFT only)
    update: async (id: string, input: CreateInboundInput): Promise<InboundOrder> => {
        await delay(300);
        const orders = await InboundService.getAll();
        const order = orders.find(o => o.id === id);
        if (!order) throw new Error("Order not found");
        if (order.status !== 'DRAFT') throw new Error("Only draft orders can be updated");

        order.supplierId = input.supplierId || order.supplierId;
        order.supplierName = input.supplierName || order.supplierName;
        order.note = input.note;
        order.receivedDate = input.receivedDate || order.receivedDate;

        order.items = input.items.map(item => ({
            id: crypto.randomUUID(),
            productId: item.productId,
            variantId: item.variantId,
            sku: item.sku,
            productName: item.productName,
            unitPrice: item.unitPrice,
            requestQuantity: item.requestQuantity,
            receivedQuantity: item.receivedQuantity,
            totalAmount: item.receivedQuantity * item.unitPrice,
            unitId: item.uomId,
            unitName: item.uomName,
            conversionRate: item.conversionRate || 1
        }));

        order.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        return order;
    }
};
