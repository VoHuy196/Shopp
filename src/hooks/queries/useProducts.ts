import { useQuery } from '@tanstack/react-query';
import { ProductService, CategoryService } from '@/services';
import type { Product, Category } from '@/types/product';
import type { Category as CategoryType } from '@/types/category';

export const useProducts = () => useQuery<Product[]>({
  queryKey: ['products'],
  queryFn: () => ProductService.getAll(),
});

export const useCategories = () => useQuery<CategoryType[]>({
  queryKey: ['categories'],
  queryFn: () => CategoryService.getAll(),
});

export const useProductQueries = () => ({
  products: useProducts(),
  categories: useCategories(),
});

