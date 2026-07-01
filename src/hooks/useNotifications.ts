// ── useNotifications ──────────────────────────────────────────────────
// Fetch notifications with Realtime subscription

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Notification } from '../types/notification';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapRow = (n: any): Notification => ({
	id: n.id,
	type: n.type,
	actorName: n.profiles?.display_name ?? 'Unknown',
	actorAvatar: n.profiles?.avatar_url ?? '',
	actorUsername: n.profiles?.username ?? '',
	articleId: n.article_id ?? null,
	articleTitle: n.articles?.title ?? null,
	commentId: n.comment_id ?? null,
	isRead: n.is_read,
	createdAt: n.created_at,
});

export const useNotifications = () => {
	const { user } = useAuth();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);

	const refetch = useCallback(async () => {
		if (!user) { setNotifications([]); setUnreadCount(0); return; }
		const { data } = await supabase
			.from('notifications')
			.select('*, profiles!actor_id(display_name, avatar_url, username), articles(title)')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.limit(50);
		if (data) {
			const mapped = data.map(mapRow);
			setNotifications(mapped);
			setUnreadCount(mapped.filter((n) => !n.isRead).length);
		}
	}, [user?.id]);

	useEffect(() => {
		refetch();
		if (!user) return;
		const channel = supabase
			.channel(`notifications:${user.id}`)
			.on('postgres_changes', {
				event: 'INSERT',
				schema: 'public',
				table: 'notifications',
				filter: `user_id=eq.${user.id}`,
			}, () => refetch())
			.subscribe();
		return () => { supabase.removeChannel(channel); };
	}, [refetch, user?.id]);

	const markAllRead = async () => {
		if (!user) return;
		await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
		setUnreadCount(0);
	};

	const deleteNotification = async (id: number) => {
		await supabase.from('notifications').delete().eq('id', id);
		setNotifications((prev) => prev.filter((n) => n.id !== id));
		setUnreadCount((prev) => {
			const deleted = notifications.find((n) => n.id === id);
			return deleted && !deleted.isRead ? prev - 1 : prev;
		});
	};

	const clearAll = async () => {
		if (!user) return;
		await supabase.from('notifications').delete().eq('user_id', user.id);
		setNotifications([]);
		setUnreadCount(0);
	};

	return { notifications, unreadCount, markAllRead, deleteNotification, clearAll };
};
