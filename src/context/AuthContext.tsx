import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/user';

type AuthContextType = {
	user: User | null;
	login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
	register: (email: string) => Promise<{ success: boolean; message: string }>;
	logout: () => void;
	isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: (User & { password: string })[] = [
	{ id: '1', name: 'Teerapat N.', email: 'admin@dishcipes.com', password: 'admin1234', role: 'admin' },
	{ id: '2', name: 'Member User', email: 'member@dishcipes.com', password: 'member1234', role: 'member' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);

	const login = async (email: string, password: string) => {
		const found = MOCK_USERS.find((u) => u.email === email && u.password === password);
		if (found) {
			const { password: _pw, ...userData } = found;
			setUser(userData);
			return { success: true, message: '' };
		}
		return { success: false, message: 'Your email or password is incorrect.' };
	};

	const register = async (email: string) => {
		const exists = MOCK_USERS.find((u) => u.email === email);
		if (exists) return { success: false, message: 'Email is already taken.' };
		return { success: true, message: '' };
	};

	const logout = () => setUser(null);

	return (
		<AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: user !== null }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
	return ctx;
};
