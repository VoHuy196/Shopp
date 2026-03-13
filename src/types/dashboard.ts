export interface DashboardMetrics {
    totalProducts: number;
    totalStockValue: number;
    lowStockCount: number;
    stockByCategory: {
        name: string;
        value: number; // Stock quantity
    }[];
    topProducts: {
        name: string;
        quantity: number;
    }[];
}