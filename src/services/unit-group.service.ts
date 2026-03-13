import type { Unit, UnitGroup, CreateUnitInput, CreateUnitGroupInput, UpdateUnitInput } from "../types/unit-group";

const STORAGE_KEY_UNITS = "ims_units";
const STORAGE_KEY_GROUPS = "ims_unit_groups";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const UnitGroupService = {
    // --- GROUPS ---
    getGroups: async (): Promise<UnitGroup[]> => {
        await delay(300);
        const data = localStorage.getItem(STORAGE_KEY_GROUPS);
        if (!data) return [];
        return JSON.parse(data);
    },

    createGroup: async (input: CreateUnitGroupInput): Promise<UnitGroup> => {
        await delay(300);
        const groups = await UnitGroupService.getGroups();

        const newGroup: UnitGroup = {
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
        const groups = await UnitGroupService.getGroups();
        const filtered = groups.filter(g => g.id !== id);
        localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(filtered));

        // Delete associated units
        const allUnits = await UnitGroupService.getAllUnits();
        const filteredUnits = allUnits.filter(u => u.groupId !== id);
        localStorage.setItem(STORAGE_KEY_UNITS, JSON.stringify(filteredUnits));
    },

    // --- UNITS ---
    getAllUnits: async (): Promise<Unit[]> => {
        const data = localStorage.getItem(STORAGE_KEY_UNITS);
        if (!data) {
            // Check for old UOM data if migrating
            const oldData = localStorage.getItem("ims_uoms");
            if (oldData) {
                localStorage.setItem(STORAGE_KEY_UNITS, oldData);
                return JSON.parse(oldData);
            }
            return [];
        }
        return JSON.parse(data);
    },

    getByGroupId: async (groupId: string): Promise<Unit[]> => {
        await delay(200);
        const all = await UnitGroupService.getAllUnits();
        return all.filter(u => u.groupId === groupId);
    },

    createUnit: async (input: CreateUnitInput): Promise<Unit> => {
        await delay(300);
        const units = await UnitGroupService.getAllUnits();

        // Check if Base Unit already exists for this group
        if (input.isBaseUnit) {
            const existingBase = units.find(u => u.groupId === input.groupId && u.isBaseUnit);
            if (existingBase) {
                throw new Error("Nhóm này đã có Đơn vị chuẩn.");
            }
        }

        // Validate rate
        if (input.isBaseUnit && input.conversionRate !== 1) {
            input.conversionRate = 1;
        }

        const newUnit: Unit = {
            id: crypto.randomUUID(),
            ...input,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        units.push(newUnit);
        localStorage.setItem(STORAGE_KEY_UNITS, JSON.stringify(units));
        return newUnit;
    },

    updateUnit: async (id: string, input: UpdateUnitInput): Promise<Unit> => {
        await delay(300);
        const units = await UnitGroupService.getAllUnits();
        const index = units.findIndex(u => u.id === id);

        if (index === -1) throw new Error("Unit not found");

        const currentUnit = units[index];

        // If changing to base unit, check constraint (excluding self)
        if (input.isBaseUnit) {
            const existingBase = units.find(u => u.groupId === currentUnit.groupId && u.isBaseUnit && u.id !== id);
            if (existingBase) {
                throw new Error("Nhóm này đã có Đơn vị chuẩn. Vui lòng bỏ chọn đơn vị chuẩn cũ trước.");
            }
        }

        const updatedUnit = {
            ...currentUnit,
            ...input,
            updatedAt: new Date().toISOString()
        };

        // Force rate = 1 if base unit
        if (updatedUnit.isBaseUnit) {
            updatedUnit.conversionRate = 1;
        }

        units[index] = updatedUnit;
        localStorage.setItem(STORAGE_KEY_UNITS, JSON.stringify(units));
        return updatedUnit;
    },

    deleteUnit: async (id: string): Promise<void> => {
        await delay(300);
        const units = await UnitGroupService.getAllUnits();
        const filtered = units.filter(u => u.id !== id);
        localStorage.setItem(STORAGE_KEY_UNITS, JSON.stringify(filtered));
    }
};
