import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/types/user';
import { UserService } from '@/services';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<User | null>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    // Kiểm tra đăng nhập khi F5 trang
    useEffect(() => {
        const storedUser = localStorage.getItem('wms_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (username: string, password: string): Promise<User | null> => {
        // Try to find matching user in UserService
        let users = await UserService.getAll();
        let found = users.find(u => (u.username === username || u.email === username) && (u.password === password));
        if (!found) {
            // If not found, attempt to restore defaults (handles older localStorage without passwords)
            users = await UserService.restoreDefaults();
            found = users.find(u => (u.username === username || u.email === username) && (u.password === password));
        }

        if (found) {
            setUser(found);
            localStorage.setItem('wms_user', JSON.stringify(found));
            return found;
        }

        return null;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('wms_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};