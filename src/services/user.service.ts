import type { User, CreateUserInput, UpdateUserInput } from '../types/user';

const STORAGE_KEY = 'ims_users';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock initial users
const INITIAL_USERS: User[] = [
    {
        id: 'user_admin',
        username: 'admin',
        email: 'admin@mystore.com',
        password: '123456',
        role: 'admin',
        createdAt: new Date().toISOString()
    },
    {
        id: 'user_customer',
        username: 'user',
        email: 'user@mystore.com',
        password: '123456',
        role: 'customer',
        createdAt: new Date().toISOString()
    }
];

export const UserService = {
    getAll: async (): Promise<User[]> => {
        await delay(300);
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
            return INITIAL_USERS;
        }

        try {
            const parsed = JSON.parse(data) as User[];
            if (!Array.isArray(parsed) || parsed.length === 0) {
                // If storage exists but is empty, restore initial users
                localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
                return INITIAL_USERS;
            }
            return parsed;
        } catch (err) {
            // If parse fails, reset to initial users
            localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
            return INITIAL_USERS;
        }
    },

    getById: async (id: string): Promise<User | undefined> => {
        await delay(200);
        const users = await UserService.getAll();
        return users.find(u => u.id === id);
    },

    create: async (input: CreateUserInput): Promise<User> => {
        await delay(500);
        const users = await UserService.getAll();

        // Check if username already exists
        if (users.some(u => u.username === input.username)) {
            throw new Error('Username đã tồn tại');
        }

        // Check if email already exists
        if (users.some(u => u.email === input.email)) {
            throw new Error('Email đã tồn tại');
        }

        const newUser: User = {
            id: crypto.randomUUID(),
            username: input.username,
            email: input.email,
            password: input.password,
            role: input.role,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return newUser;
    },

    update: async (id: string, input: UpdateUserInput): Promise<User> => {
        await delay(500);
        const users = await UserService.getAll();
        const index = users.findIndex(u => u.id === id);

        if (index === -1) throw new Error('User không tồn tại');

        const existingUser = users[index];

        // Check if username already exists (except current user)
        if (input.username && input.username !== existingUser.username) {
            if (users.some(u => u.username === input.username)) {
                throw new Error('Username đã tồn tại');
            }
        }

        // Check if email already exists (except current user)
        if (input.email && input.email !== existingUser.email) {
            if (users.some(u => u.email === input.email)) {
                throw new Error('Email đã tồn tại');
            }
        }

        const updatedUser: User = {
            ...existingUser,
            ...input
        };

        users[index] = updatedUser;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return updatedUser;
    },

    delete: async (id: string): Promise<void> => {
        await delay(300);
        const users = await UserService.getAll();
        const filtered = users.filter(u => u.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    ,

    // Restore initial default users (admin + customer)
    restoreDefaults: async (): Promise<User[]> => {
        await delay(200);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
    }
};
