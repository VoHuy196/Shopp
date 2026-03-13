import type { OutboundOrder, CreateOutboundInput } from "../types/outbound";
import { ProductService } from "./product.service";

const STORAGE_KEY = "ims_outbounds";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const OutboundService = {
    getAll: async (): Promise<OutboundOrder[]> => {
        await delay(300);
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    getById: async (id: string): Promise<OutboundOrder | undefined> => {
        await delay(200);
        const orders = await OutboundService.getAll();
        return orders.find((o) => o.id === id);
    },

    // Create Order
    // If Wholesale -> Status DRAFT (No Stock Change)
    // If Retail -> Status COMPLETED (Deduct Stock immediately)
    create: async (input: CreateOutboundInput): Promise<OutboundOrder> => {
        await delay(500);
        const orders = await OutboundService.getAll();

        // Auto generate Code "PX-YYMMDD-XXX"
        const today = new Date();
        const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
        const count = orders.filter(o => o.code.startsWith(`PX-${dateStr}`)).length + 1;
        const code = `PX-${dateStr}-${count.toString().padStart(3, '0')}`;

        const isRetail = input.type === 'RETAIL';
        const initialStatus = isRetail ? 'COMPLETED' : 'DRAFT';

        const totalAmount = input.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

        // Calculate payment status
        const paidAmount = (input.payments || []).reduce((sum, p) => p.method !== 'CREDIT' ? sum + p.amount : sum, 0);
        let paymentStatus: any = 'UNPAID';
        if (paidAmount >= totalAmount) paymentStatus = 'PAID';
        else if (paidAmount > 0) paymentStatus = 'PARTIALLY_PAID';

        const newOrder: OutboundOrder = {
            id: crypto.randomUUID(),
            code,
            type: input.type,
            customerName: input.customerName || (isRetail ? "Khách vãng lai" : "Khách hàng"),
            note: input.note,
            status: initialStatus,
            items: input.items.map(item => ({
                ...item,
                id: crypto.randomUUID(),
                totalAmount: item.quantity * item.unitPrice,
                unitId: item.uomId,
                unitName: item.uomName,
                conversionRate: item.conversionRate || 1
            })),
            exportDate: input.exportDate || new Date().toISOString(),
            createdBy: input.performer || 'Admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            totalAmount,
            paymentMethod: input.paymentMethod || 'CASH',
            paymentStatus: paymentStatus,
            payments: input.payments || (input.paymentMethod ? [{ method: input.paymentMethod as any, amount: totalAmount }] : [{ method: 'CASH', amount: totalAmount }])
        };

        // Trigger stock deduction if RETAIL
        if (isRetail) {
            for (const item of newOrder.items) {
                // Negative quantity for deduction
                const qty = item.quantity * (item.conversionRate || 1);
                await ProductService.updateStock(item.productId, item.variantId, -qty);
            }
        }

        orders.unshift(newOrder);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        return newOrder;
    },


    // Approve Wholesale Order
    approve: async (id: string): Promise<void> => {
        await delay(300);
        const orders = await OutboundService.getAll();
        const order = orders.find(o => o.id === id);
        if (!order) throw new Error("Order not found");
        if (order.status !== 'DRAFT') throw new Error("Only draft orders can be approved");

        // Deduct Stock
        for (const item of order.items) {
            const qty = item.quantity * (item.conversionRate || 1);
            await ProductService.updateStock(item.productId, item.variantId, -qty);
        }

        order.status = 'COMPLETED';
        order.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    },

    // Update Order (DRAFT only)
    update: async (id: string, input: CreateOutboundInput): Promise<OutboundOrder> => {
        await delay(300);
        const orders = await OutboundService.getAll();
        const order = orders.find(o => o.id === id);
        if (!order) throw new Error("Order not found");
        if (order.status !== 'DRAFT') throw new Error("Only draft orders can be updated");

        // Update basic fields
        order.customerName = input.customerName || order.customerName;
        order.note = input.note;
        order.exportDate = input.exportDate || order.exportDate;
        order.paymentMethod = input.paymentMethod || order.paymentMethod;
        order.payments = input.payments;

        // Recalculate totals
        order.items = input.items.map(item => ({
            id: crypto.randomUUID(),
            productId: item.productId,
            variantId: item.variantId,
            sku: item.sku,
            productName: item.productName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            totalAmount: item.quantity * item.unitPrice,
            unitId: item.uomId,
            unitName: item.uomName,
            conversionRate: item.conversionRate || 1
        }));

        const totalAmount = input.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        order.totalAmount = totalAmount;

        // Recalculate payment status
        const paidAmount = (input.payments || []).reduce((sum, p) => p.method !== 'CREDIT' ? sum + p.amount : sum, 0);
        if (paidAmount >= totalAmount) order.paymentStatus = 'PAID';
        else if (paidAmount > 0) order.paymentStatus = 'PARTIALLY_PAID';
        else order.paymentStatus = 'UNPAID';

        order.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        return order;
    }
};
