export interface Supplier {
    id: string;
    code: string;
    name: string;
    taxCode?: string;
    address?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    note?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateSupplierInput {
    code: string;
    name: string;
    taxCode?: string;
    address?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    note?: string;
}
