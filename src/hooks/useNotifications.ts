// ── useNotifications ──────────────────────────────────────────────────
// Fetch notifications with Realtime subscription

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Notification } from '../types/notification';
import {
	fetchNotifications,
	markAllNotificationsRead,
	deleteNotification as dbDeleteNotification,
	clearAllNotifications,
} from '../lib/queries/notifications';

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
		const { data } = await fetchNotifications(user.id);
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
		await markAllNotificationsRead(user.id);
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
		setUnreadCount(0);
	};

	const removeNotification = async (id: number) => {
		await dbDeleteNotification(id);
		setNotifications((prev) => {
			const deleted = prev.find((n) => n.id === id);
			if (deleted && !deleted.isRead) setUnreadCount((c) => c - 1);
			return prev.filter((n) => n.id !== id);
		});
	};

	const clearAll = async () => {
		if (!user) return;
		await clearAllNotifications(user.id);
		setNotifications([]);
		setUnreadCount(0);
	};

	return { notifications, unreadCount, markAllRead, deleteNotification: removeNotification, clearAll };
};
