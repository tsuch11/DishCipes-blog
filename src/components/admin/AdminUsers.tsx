// ── AdminUsers ────────────────────────────────────────────────────────
// User management: promote/demote/ban with confirmation modals

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import ConfirmModal from '../ui/ConfirmModal';

// ── Types ─────────────────────────────────────────────────────────────
type AdminUser = {
	id: string;
	displayName: string;
	username: string;
	email: string;
	role: string;
	avatarUrl: string;
	isBanned: boolean;
};

type Props = {
	currentUserId: string;
};

// ── Component ─────────────────────────────────────────────────────────
const AdminUsers = ({ currentUserId }: Props) => {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [promoteTargetId, setPromoteTargetId] = useState<string | null>(null);
	const [demoteTargetId, setDemoteTargetId] = useState<string | null>(null);

	const fetchUsers = () => {
		supabase.from('profiles').select('id, display_name, username, email, role, avatar_url, is_banned').order('created_at', { ascending: false }).then(({ data }) => {
			if (data) setUsers(data.map((u) => ({ id: u.id, displayName: u.display_name, username: u.username, email: u.email, role: u.role, avatarUrl: u.avatar_url ?? '', isBanned: u.is_banned ?? false })));
		});
	};

	useEffect(() => { fetchUsers(); }, []);

	const handlePromoteConfirm = async () => {
		if (!promoteTargetId) return;
		await supabase.from('profiles').update({ role: 'admin' }).eq('id', promoteTargetId);
		setPromoteTargetId(null);
		fetchUsers();
	};

	const handleDemoteConfirm = async () => {
		if (!demoteTargetId) return;
		await supabase.from('profiles').update({ role: 'member' }).eq('id', demoteTargetId);
		setDemoteTargetId(null);
		fetchUsers();
	};

	const handleToggleBan = async (id: string, current: boolean) => {
		await supabase.from('profiles').update({ is_banned: !current }).eq('id', id);
		fetchUsers();
	};

	return (
		<div className="px-4 py-6 md:px-12 md:py-8">
			<h1 className="text-xl font-bold text-stone-800 dark:text-brown-100 mb-6">User management</h1>
			<hr className="border-stone-200 dark:border-dark-border mb-6" />
			<div className="bg-white dark:bg-dark-surface rounded-xl border border-stone-200 dark:border-dark-border overflow-hidden">
				{users.length === 0 && <p className="px-5 py-10 text-center text-sm text-stone-400 dark:text-brown-400">No users</p>}
				{users.map((u, i) => (
					<div key={u.id} className={`flex items-center gap-4 px-5 py-3.5 ${i < users.length - 1 ? 'border-b border-stone-100 dark:border-dark-border' : ''}`}>
						<div className="w-9 h-9 rounded-full bg-stone-200 dark:bg-dark-border overflow-hidden shrink-0">
							{u.avatarUrl ? <img src={u.avatarUrl} alt={u.displayName} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-300 dark:bg-dark-border" />}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-stone-700 dark:text-brown-100 truncate">{u.displayName}</p>
							<p className="text-xs text-stone-400 dark:text-brown-400 truncate">@{u.username} · {u.email}</p>
						</div>
						<div className="flex items-center gap-2 shrink-0">
							<span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${u.role === 'admin' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-stone-100 text-stone-500 dark:bg-dark-elevated dark:text-brown-300'}`}>{u.role}</span>
							{u.isBanned && <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400">banned</span>}
						</div>
						<div className="flex items-center gap-2 shrink-0">
							{u.role !== 'admin' && (
								<button onClick={() => setPromoteTargetId(u.id)} className="px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-brown-200 bg-stone-100 dark:bg-dark-elevated rounded-lg hover:bg-stone-200 dark:hover:bg-dark-border transition-colors duration-150">Promote</button>
							)}
							{u.role === 'admin' && u.id !== currentUserId && (
								<button onClick={() => setDemoteTargetId(u.id)} className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 rounded-lg hover:bg-orange-100 transition-colors duration-150">Demote</button>
							)}
							{u.role !== 'admin' && (
								<button onClick={() => handleToggleBan(u.id, u.isBanned)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-150 ${u.isBanned ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100' : 'text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100'}`}>{u.isBanned ? 'Unban' : 'Ban'}</button>
							)}
						</div>
					</div>
				))}
			</div>

			{promoteTargetId !== null && (
				<ConfirmModal
					title="Promote to admin"
					message="Are you sure you want to promote this user to admin?"
					confirmLabel="Promote"
					cancelLabel="Cancel"
					onConfirm={handlePromoteConfirm}
					onCancel={() => setPromoteTargetId(null)}
				/>
			)}
			{demoteTargetId !== null && (
				<ConfirmModal
					title="Demote to member"
					message="Are you sure you want to demote this admin to member?"
					confirmLabel="Demote"
					cancelLabel="Cancel"
					onConfirm={handleDemoteConfirm}
					onCancel={() => setDemoteTargetId(null)}
				/>
			)}
		</div>
	);
};

export default AdminUsers;
