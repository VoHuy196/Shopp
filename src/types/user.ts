export interface User {
    id: string;
    username: string;
    email: string;
    password?: string;
    role: 'admin' | 'customer' | 'staff';
    createdAt: string;
}

export interface CreateUserInput {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'customer' | 'staff';
}

export interface UpdateUserInput {
    username?: string;
    email?: string;
    role?: 'admin' | 'customer' | 'staff';
}
