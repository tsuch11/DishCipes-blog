// ── AuthContext ───────────────────────────────────────────────────────
// Auth state provider — Supabase Auth + profiles table
// แก้ไขได้: role types (guest / member / admin), updateProfile fields

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/user';
import { supabase } from '../lib/supabase';

type AuthContextType = {
	user: User | null;
	login: (email: string, password: string) => Promise<{ success: boolean; message: string; role?: string }>;
	register: (data: { name: string; username: string; email: string; password: string }) => Promise<{ success: boolean; message: string }>;
	verifyEmail: (email: string, token: string) => Promise<{ success: boolean; message: string }>;
	sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
	verifyPasswordReset: (email: string, token: string) => Promise<{ success: boolean; message: string }>;
	setNewPassword: (password: string) => Promise<{ success: boolean; message: string }>;
	updateProfile: (data: { name: string; username: string; avatar?: string; bio?: string }) => Promise<{ success: boolean }>;
	resetPassword: (current: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
	logout: () => void;
	isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);

	// ── Hooks ─────────────────────────────────────────────────────────
	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session?.user) fetchProfile(session.user.id);
		});

		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.user) fetchProfile(session.user.id);
			else setUser(null);
		});

		return () => subscription.unsubscribe();
	}, []);

	// ── Helpers ───────────────────────────────────────────────────────
	const fetchProfile = async (id: string) => {
		const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
		if (data) {
			setUser({
				id: data.id,
				name: data.display_name ?? '',
				username: data.username ?? '',
				email: data.email ?? '',
				role: data.role ?? 'member',
				avatar: data.avatar_url && !data.avatar_url.startsWith('blob:') ? data.avatar_url : undefined,
				bio: data.bio ?? undefined,
			});
		}
	};

	// ── Handlers ──────────────────────────────────────────────────────
	const login = async (emailOrUsername: string, password: string) => {
		let email = emailOrUsername;

		if (!emailOrUsername.includes('@')) {
			const { data: profile } = await supabase
				.from('profiles')
				.select('email')
				.eq('username', emailOrUsername)
				.single();
			if (!profile?.email) return { success: false, message: 'Your password is incorrect or this email doesn\'t exist' };
			email = profile.email;
		}

		const { data, error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			if (error.message.toLowerCase().includes('email not confirmed')) return { success: false, message: 'email_not_confirmed' };
			return { success: false, message: 'Your password is incorrect or this email doesn\'t exist' };
		}
		const role = data.user ? (await supabase.from('profiles').select('role').eq('id', data.user.id).single()).data?.role : 'member';
		return { success: true, message: '', role: role ?? 'member' };
	};

	const register = async (data: { name: string; username: string; email: string; password: string }) => {
		const { data: authData, error } = await supabase.auth.signUp({ email: data.email, password: data.password });
		if (error) return { success: false, message: error.message };
		if (authData.user) {
			await supabase.from('profiles').insert({
				id: authData.user.id,
				email: data.email,
				display_name: data.name,
				username: data.username,
				role: 'member',
			});
		}
		return { success: true, message: '' };
	};

	const updateProfile = async (data: { name: string; username: string; avatar?: string; bio?: string }) => {
		if (!user) return { success: false };
		const { error } = await supabase.from('profiles').update({
			display_name: data.name,
			username: data.username,
			avatar_url: data.avatar,
			bio: data.bio,
		}).eq('id', user.id);
		if (error) return { success: false };
		setUser((prev) => prev ? { ...prev, ...data } : prev);
		return { success: true };
	};

	const verifyEmail = async (email: string, token: string) => {
		const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
		if (error) return { success: false, message: error.message };
		return { success: true, message: '' };
	};

	const sendPasswordReset = async (email: string) => {
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/set-new-password`,
		});
		if (error) return { success: false, message: error.message };
		return { success: true, message: '' };
	};

	const verifyPasswordReset = async (email: string, token: string) => {
		const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
		if (error) return { success: false, message: error.message };
		return { success: true, message: '' };
	};

	const setNewPassword = async (password: string) => {
		const { error } = await supabase.auth.updateUser({ password });
		if (error) return { success: false, message: error.message };
		return { success: true, message: '' };
	};

	const resetPassword = async (_current: string, newPassword: string) => {
		const { error } = await supabase.auth.updateUser({ password: newPassword });
		if (error) return { success: false, message: error.message };
		return { success: true, message: '' };
	};

	const logout = async () => {
		await supabase.auth.signOut();
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, login, register, verifyEmail, sendPasswordReset, verifyPasswordReset, setNewPassword, updateProfile, resetPassword, logout, isAuthenticated: user !== null }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
	return ctx;
};
