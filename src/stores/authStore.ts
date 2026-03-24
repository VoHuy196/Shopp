import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/user';
import { UserService } from '@/services';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        try {
          let users = await UserService.getAll();
          let found = users.find(u => (u.username === username || u.email === username) && u.password === password);
          if (!found) {
            users = await UserService.restoreDefaults?.();
            found = users?.find(u => (u.username === username || u.email === username) && u.password === password);
          }
          if (found) {
            set({ user: found, isAuthenticated: true });
            return found;
          }
          return null;
        } catch {
          return null;
        }
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'wms-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

