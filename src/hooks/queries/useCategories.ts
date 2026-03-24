import { useQuery } from '@tanstack/react-query';
import { CategoryService } from '@/services';
import type { Category } from '@/types/category';

export const useCategories = () => useQuery<Category[]>({
  queryKey: ['categories'],
  queryFn: () => CategoryService.getAll(),
});

