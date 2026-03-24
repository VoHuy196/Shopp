import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 mins
      gcTime: 10 * 60 * 1000, // 10 mins
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('NOT_FOUND')) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

