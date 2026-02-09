
import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (name: string, email: string, password: string) => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('attendai_user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse user from storage');
                localStorage.removeItem('attendai_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        // Mock login
        const userData = {
            id: '1',
            email,
            name: email.split('@')[0]
        };
        setUser(userData);
        localStorage.setItem('attendai_user', JSON.stringify(userData));
    };

    const register = async (name: string, email: string, password: string) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            email
        };

        setUser(newUser);
        localStorage.setItem('attendai_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('attendai_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
