import type { Category, CreateCategoryInput } from "../types/category";

const STORAGE_KEY = 'wms_categories';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const CategoryService = {
    getAll: async (): Promise<Category[]> => {
        await delay(300);
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    getById: async (id: string): Promise<Category | undefined> => {
        const categories = await CategoryService.getAll();
        return categories.find(c => c.id === id);
    },

    create: async (input: CreateCategoryInput): Promise<Category> => {
        await delay(500);
        const categories = await CategoryService.getAll();
        const newCategory: Category = {
            ...input,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        categories.unshift(newCategory);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
        return newCategory;
    },

    update: async (id: string, input: Partial<CreateCategoryInput>): Promise<Category> => {
        await delay(500);
        const categories = await CategoryService.getAll();
        const index = categories.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Category not found');

        const updatedCategory = {
            ...categories[index],
            ...input,
            updatedAt: new Date().toISOString()
        };
        categories[index] = updatedCategory;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
        return updatedCategory;
    },

    delete: async (id: string): Promise<void> => {
        await delay(500);
        const categories = await CategoryService.getAll();
        const filtered = categories.filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
};
