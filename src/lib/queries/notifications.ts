// ── queries/notifications.ts ──────────────────────────────────────────
// Raw Supabase calls for notifications — no mapping, no React state

import { supabase } from '../supabase';

const NOTIFICATION_SELECT = '*, profiles!actor_id(display_name, avatar_url, username), articles(title)' as const;

export const fetchNotifications = (userId: string) =>
	supabase
		.from('notifications')
		.select(NOTIFICATION_SELECT)
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(50);

export const markAllNotificationsRead = (userId: string) =>
	supabase
		.from('notifications')
		.update({ is_read: true })
		.eq('user_id', userId)
		.eq('is_read', false);

export const deleteNotification = (id: number) =>
	supabase
		.from('notifications')
		.delete()
		.eq('id', id);

export const clearAllNotifications = (userId: string) =>
	supabase
		.from('notifications')
		.delete()
		.eq('user_id', userId);
