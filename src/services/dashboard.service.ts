import { ProductService } from "./product.service";
import { CategoryService } from "./category.service";
import type { DashboardMetrics } from "@/types";

export const DashboardService = {
    getMetrics: async (): Promise<DashboardMetrics> => {
        const [products, categories] = await Promise.all([
            ProductService.getAll(),
            CategoryService.getAll()
        ]);

        let totalProducts = 0;
        let totalStockValue = 0;
        let lowStockCount = 0;
        const stockByCatMap: Record<string, number> = {};

        // Helper Map for Categories
        const categoryMap = new Map(categories.map(c => [c.id, c]));

        products.forEach(p => {
            totalProducts++;

            // Calculate total stock for this product
            const productStock = p.variants.reduce((sum, v) => sum + v.quantity, 0);

            // Value = quantity * price (using salePrice as proxy for value, ideally use costPrice but not available)
            // Or average price? adhering to simple logic: sum(qty * price)
            const productValue = p.variants.reduce((sum, v) => sum + (v.quantity * (v.price || 0)), 0);
            totalStockValue += productValue;

            // Low Stock Check
            // Logic: if any variant is below category threshold? Or sum?
            // Usually per SKU. But let's check against Category Threshold.
            const threshold = categoryMap.get(p.categoryId || '')?.minStockThreshold || 0;
            // If any variant < threshold => count as low stock product? Or count total low skus?
            // Let's count *products* that have at least one variant < threshold (or 0)
            const isLow = p.variants.some(v => v.quantity <= threshold);
            if (isLow) lowStockCount++;

            // Stock by Category
            const catName = categoryMap.get(p.categoryId || '')?.name || 'Chưa phân loại';
            stockByCatMap[catName] = (stockByCatMap[catName] || 0) + productStock;
        });

        // Format for Pie Chart
        const stockByCategory = Object.entries(stockByCatMap).map(([name, value]) => ({ name, value }));

        // Top 5 Products by Quantity
        const topProducts = products
            .map(p => ({
                name: p.name,
                quantity: p.variants.reduce((sum, v) => sum + v.quantity, 0)
            }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        return {
            totalProducts,
            totalStockValue,
            lowStockCount,
            stockByCategory,
            topProducts
        };
    }
};
