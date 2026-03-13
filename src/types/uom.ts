export interface UOMGroup {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UOM {
    id: string;
    groupId: string; // Linked to UOM Group
    name: string; // e.g., "Cái", "Thùng"
    isBaseUnit: boolean; // True if this is the base unit (rate = 1)
    conversionRate: number; // 1 for Base Unit. e.g., 24 for "Thùng" (1 Thùng = 24 Base Units)
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUOMGroupInput {
    name: string;
    description?: string;
}

export interface CreateUOMInput {
    groupId: string;
    name: string;
    isBaseUnit: boolean;
    conversionRate: number;
    description?: string;
}

export interface UpdateUOMInput {
    name?: string;
    isBaseUnit?: boolean;
    conversionRate?: number;
    description?: string;
}
