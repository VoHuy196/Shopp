import type { Supplier, CreateSupplierInput } from "../types/supplier";
import mockData from "../data/mock-data.json";

const STORAGE_KEY = "ims_suppliers";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const SupplierService = {
    getAll: async (): Promise<Supplier[]> => {
        await delay(300);
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            // Seed mock data
            // Map mock data which might be missing some new fields
            const seededData = mockData.suppliers.map((s: any, index: number) => ({
                id: s.id,
                code: `SUP00${index + 1}`, // Generate default code
                name: s.name,
                contactPerson: s.contact,
                phone: s.phone,
                address: s.address,
                email: s.email,
                taxCode: "",
                note: ""
            }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seededData));
            return seededData as Supplier[];
        }
        return JSON.parse(data);
    },

    getById: async (id: string): Promise<Supplier | undefined> => {
        await delay(200);
        const suppliers = await SupplierService.getAll();
        return suppliers.find((s) => s.id === id);
    },

    create: async (input: CreateSupplierInput): Promise<Supplier> => {
        await delay(400);
        const suppliers = await SupplierService.getAll();

        // Check duplicate code
        if (suppliers.some(s => s.code === input.code)) {
            throw new Error("Mã nhà cung cấp đã tồn tại");
        }

        const newSupplier: Supplier = {
            ...input,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        suppliers.unshift(newSupplier);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
        return newSupplier;
    },

    update: async (id: string, input: Partial<CreateSupplierInput>): Promise<Supplier> => {
        await delay(400);
        const suppliers = await SupplierService.getAll();
        const index = suppliers.findIndex(s => s.id === id);
        if (index === -1) throw new Error("Supplier not found");

        const updated = {
            ...suppliers[index],
            ...input,
            updatedAt: new Date().toISOString()
        };

        suppliers[index] = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
        return updated;
    },

    delete: async (id: string): Promise<void> => {
        await delay(300);
        const suppliers = await SupplierService.getAll();
        const filtered = suppliers.filter((s) => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
};
