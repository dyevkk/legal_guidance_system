'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User { id: string; name: string; email: string; }
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('nyaya_token');
        const storedUser = localStorage.getItem('nyaya_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await axios.post(`${API}/api/auth/login`, { email, password });
        const { token: t, user: u } = res.data;
        setToken(t); setUser(u);
        localStorage.setItem('nyaya_token', t);
        localStorage.setItem('nyaya_user', JSON.stringify(u));
        axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    };

    const register = async (name: string, email: string, password: string) => {
        const res = await axios.post(`${API}/api/auth/register`, { name, email, password });
        const { token: t, user: u } = res.data;
        setToken(t); setUser(u);
        localStorage.setItem('nyaya_token', t);
        localStorage.setItem('nyaya_user', JSON.stringify(u));
        axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    };

    const logout = () => {
        setToken(null); setUser(null);
        localStorage.removeItem('nyaya_token');
        localStorage.removeItem('nyaya_user');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const API_URL = API;
