export interface UnitGroup {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Unit {
    id: string;
    groupId: string; // Linked to Unit Group
    name: string; // e.g., "Cái", "Thùng"
    isBaseUnit: boolean; // True if this is the base unit (rate = 1)
    conversionRate: number; // 1 for Base Unit. e.g., 24 for "Thùng" (1 Thùng = 24 Base Units)
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUnitGroupInput {
    name: string;
    description?: string;
}

export interface CreateUnitInput {
    groupId: string;
    name: string;
    isBaseUnit: boolean;
    conversionRate: number;
    description?: string;
}

export interface UpdateUnitInput {
    name?: string;
    isBaseUnit?: boolean;
    conversionRate?: number;
    description?: string;
}
