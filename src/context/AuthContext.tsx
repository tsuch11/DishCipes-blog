import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/user';

type AuthContextType = {
	user: User | null;
	login: (email: string, password: string) => Promise<{ success: boolean; message: string; role?: string }>;
	register: (email: string) => Promise<{ success: boolean; message: string }>;
	updateProfile: (data: { name: string; username: string; avatar?: string; bio?: string }) => Promise<{ success: boolean }>;
	resetPassword: (current: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
	logout: () => void;
	isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: (User & { password: string })[] = [
	{ id: '1', name: 'Teerapat N.', username: 'teerapat', email: 'admin@dishcipes.com', password: 'admin1234', role: 'admin' },
	{ id: '2', name: 'Member User', username: 'member', email: 'member@dishcipes.com', password: 'member1234', role: 'member' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [currentPassword, setCurrentPassword] = useState('');

	const login = async (email: string, password: string) => {
		const found = MOCK_USERS.find((u) => u.email === email && u.password === password);
		if (found) {
			const { password: pw, ...userData } = found;
			setUser(userData);
			setCurrentPassword(pw);
			return { success: true, message: '', role: userData.role };
		}
		return { success: false, message: 'Your email or password is incorrect.' };
	};

	const register = async (email: string) => {
		const exists = MOCK_USERS.find((u) => u.email === email);
		if (exists) return { success: false, message: 'Email is already taken.' };
		return { success: true, message: '' };
	};

	const updateProfile = async (data: { name: string; username: string; avatar?: string; bio?: string }) => {
		if (!user) return { success: false };
		setUser((prev) => prev ? { ...prev, ...data } : prev);
		return { success: true };
	};

	const resetPassword = async (current: string, newPassword: string) => {
		if (current !== currentPassword) {
			return { success: false, message: 'Current password is incorrect.' };
		}
		setCurrentPassword(newPassword);
		return { success: true, message: '' };
	};

	const logout = () => {
		setUser(null);
		setCurrentPassword('');
	};

	return (
		<AuthContext.Provider value={{ user, login, register, updateProfile, resetPassword, logout, isAuthenticated: user !== null }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
	return ctx;
};
