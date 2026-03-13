import type { UOM, UOMGroup, CreateUOMInput, CreateUOMGroupInput, UpdateUOMInput } from "../types/uom";

const STORAGE_KEY_UOMS = "ims_uoms";
const STORAGE_KEY_GROUPS = "ims_uom_groups";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const UOMService = {
    // --- GROUPS ---
    getGroups: async (): Promise<UOMGroup[]> => {
        await delay(300);
        const data = localStorage.getItem(STORAGE_KEY_GROUPS);
        if (!data) return [];
        return JSON.parse(data);
    },

    createGroup: async (input: CreateUOMGroupInput): Promise<UOMGroup> => {
        await delay(300);
        const groups = await UOMService.getGroups();

        const newGroup: UOMGroup = {
            id: crypto.randomUUID(),
            ...input,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        groups.push(newGroup);
        localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups));
        return newGroup;
    },

    deleteGroup: async (id: string): Promise<void> => {
        await delay(300);
        const groups = await UOMService.getGroups();
        const filtered = groups.filter(g => g.id !== id);
        localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(filtered));

        // Delete associated UOMs
        const allUoms = await UOMService.getAllUOMs();
        const filteredUoms = allUoms.filter(u => u.groupId !== id);
        localStorage.setItem(STORAGE_KEY_UOMS, JSON.stringify(filteredUoms));
    },

    // --- UOMS ---
    getAllUOMs: async (): Promise<UOM[]> => {
        const data = localStorage.getItem(STORAGE_KEY_UOMS);
        if (!data) return [];
        return JSON.parse(data);
    },

    getByGroupId: async (groupId: string): Promise<UOM[]> => {
        await delay(200);
        const all = await UOMService.getAllUOMs();
        return all.filter(u => u.groupId === groupId);
    },

    createUOM: async (input: CreateUOMInput): Promise<UOM> => {
        await delay(300);
        const uoms = await UOMService.getAllUOMs();

        // Check if Base Unit already exists for this group
        if (input.isBaseUnit) {
            const existingBase = uoms.find(u => u.groupId === input.groupId && u.isBaseUnit);
            if (existingBase) {
                throw new Error("Nhóm này đã có Đơn vị chuẩn.");
            }
        }

        // Validate rate
        if (input.isBaseUnit && input.conversionRate !== 1) {
            input.conversionRate = 1;
        }

        const newUOM: UOM = {
            id: crypto.randomUUID(),
            ...input,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        uoms.push(newUOM);
        localStorage.setItem(STORAGE_KEY_UOMS, JSON.stringify(uoms));
        return newUOM;
    },

    updateUOM: async (id: string, input: UpdateUOMInput): Promise<UOM> => {
        await delay(300);
        const uoms = await UOMService.getAllUOMs();
        const index = uoms.findIndex(u => u.id === id);

        if (index === -1) throw new Error("UOM not found");

        const currentUOM = uoms[index];

        // If changing to base unit, check constraint (excluding self)
        if (input.isBaseUnit) {
            const existingBase = uoms.find(u => u.groupId === currentUOM.groupId && u.isBaseUnit && u.id !== id);
            if (existingBase) {
                // Option: Auto-downgrade the old base unit? Or throw error?
                // For simplicity: Throw error
                throw new Error("Nhóm này đã có Đơn vị chuẩn. Vui lòng bỏ chọn đơn vị chuẩn cũ trước.");
            }
        }

        const updatedUOM = {
            ...currentUOM,
            ...input,
            updatedAt: new Date().toISOString()
        };

        // Force rate = 1 if base unit
        if (updatedUOM.isBaseUnit) {
            updatedUOM.conversionRate = 1;
        }

        uoms[index] = updatedUOM;
        localStorage.setItem(STORAGE_KEY_UOMS, JSON.stringify(uoms));
        return updatedUOM;
    },

    deleteUOM: async (id: string): Promise<void> => {
        await delay(300);
        const uoms = await UOMService.getAllUOMs();
        const filtered = uoms.filter(u => u.id !== id);
        localStorage.setItem(STORAGE_KEY_UOMS, JSON.stringify(filtered));
    }
};
