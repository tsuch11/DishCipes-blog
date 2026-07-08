// ── AdminProfile ──────────────────────────────────────────────────────
// Admin profile editor with avatar upload

import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import type { User } from '../../types/user';

// ── Types ─────────────────────────────────────────────────────────────
type Props = {
	user: User;
	updateProfile: (data: { name: string; username: string; avatar?: string; bio?: string }) => Promise<{ success: boolean }>;
	showToast: (title: string, message: string) => void;
};

const inputCls = (err?: boolean) =>
	`w-full px-4 py-3 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border rounded-xl outline-none placeholder:text-stone-300 dark:placeholder:text-brown-400 transition-colors duration-150 ${err ? 'border-red-400' : 'border-stone-200 dark:border-dark-border focus:border-stone-400 dark:focus:border-dark-border'}`;

// ── Component ─────────────────────────────────────────────────────────
const AdminProfile = ({ user, updateProfile, showToast }: Props) => {
	const [name, setName] = useState(user.name);
	const [username, setUsername] = useState(user.username);
	const [avatar, setAvatar] = useState(user.avatar ?? '');
	const [bio, setBio] = useState(user.bio ?? '');
	const avatarRef = useRef<HTMLInputElement>(null);

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const ext = file.name.split('.').pop() ?? 'jpg';
		const path = `${user.id}.${ext}`;
		const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
		if (error) { console.error(error); return; }
		const { data } = supabase.storage.from('avatars').getPublicUrl(path);
		setAvatar(data.publicUrl);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		await updateProfile({ name, username, avatar, bio });
		showToast('Profile updated', 'Your profile has been successfully updated');
	};

	return (
		<div className="px-4 py-6 md:px-12 md:py-8">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-xl font-bold text-stone-800 dark:text-brown-100">Profile</h1>
				<button type="submit" form="admin-profile-form" className="px-6 py-2.5 text-sm font-medium text-white bg-stone-800 rounded-full hover:bg-stone-700 transition-colors duration-150">Save</button>
			</div>
			<hr className="border-stone-200 dark:border-dark-border mb-6" />
			<form id="admin-profile-form" onSubmit={handleSave} className="max-w-2xl flex flex-col gap-5">
				<div className="flex items-center gap-5 pb-5 border-b border-stone-200 dark:border-dark-border">
					<div className="w-20 h-20 rounded-full overflow-hidden bg-stone-200 dark:bg-dark-elevated shrink-0">
						{avatar ? (
							<img src={avatar} alt={name} className="w-full h-full object-cover" />
						) : (
							<div className="w-full h-full flex items-center justify-center">
								<svg className="w-8 h-8 text-stone-400 dark:text-brown-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
							</div>
						)}
					</div>
					<input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
					<button type="button" onClick={() => avatarRef.current?.click()} className="px-5 py-2.5 text-sm font-medium text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-300 dark:border-dark-border rounded-full hover:bg-stone-50 dark:hover:bg-dark-border transition-colors duration-150">Upload profile picture</button>
				</div>
				<div className="flex flex-col gap-1.5">
					<label className="text-sm text-stone-500 dark:text-brown-300">Name</label>
					<input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls()} />
				</div>
				<div className="flex flex-col gap-1.5">
					<label className="text-sm text-stone-500 dark:text-brown-300">Username</label>
					<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls()} />
				</div>
				<div className="flex flex-col gap-1.5">
					<label className="text-sm text-stone-500 dark:text-brown-300">Email</label>
					<input type="email" value={user.email} disabled className="w-full px-4 py-3 text-sm text-stone-400 dark:text-brown-400 bg-stone-50 dark:bg-dark-bg border border-stone-200 dark:border-dark-border rounded-xl outline-none cursor-not-allowed" />
				</div>
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between">
						<label className="text-sm text-stone-500 dark:text-brown-300">Bio (max 120 letters)</label>
						<span className={`text-xs ${bio.length > 120 ? 'text-red-400' : 'text-stone-400 dark:text-brown-400'}`}>{bio.length}/120</span>
					</div>
					<textarea value={bio} maxLength={120} rows={4} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." className="w-full px-4 py-3 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-xl outline-none focus:border-stone-400 placeholder:text-stone-300 dark:placeholder:text-brown-400 transition-colors duration-150 resize-none" />
				</div>
			</form>
		</div>
	);
};

export default AdminProfile;
