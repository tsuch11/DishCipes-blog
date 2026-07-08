// ── AdminNotifications ────────────────────────────────────────────────
// Notification list for admin panel with mark-read and delete

import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../types/notification';
import trashIcon from '../../assets/images/icons/Trash_light.svg';

const getNotifText = (n: Notification) => {
	switch (n.type) {
		case 'comment': return `commented on "${n.articleTitle}"`;
		case 'reply': return 'replied to your comment';
		case 'article_like': return `liked "${n.articleTitle}"`;
		case 'comment_like': return 'liked your comment';
		case 'follow': return 'followed you';
		case 'new_article': return `published "${n.articleTitle}"`;
		case 'new_user': return 'just joined DishCipes';
		default: return '';
	}
};

// ── Component ─────────────────────────────────────────────────────────
const AdminNotifications = () => {
	const { notifications, markAllRead, deleteNotification } = useNotifications();

	return (
		<div className="px-4 py-6 md:px-12 md:py-8">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-xl font-bold text-stone-800 dark:text-brown-100">Notification</h1>
				{notifications.some((n) => !n.isRead) && (
					<button onClick={markAllRead} className="text-sm text-stone-500 dark:text-brown-300 hover:text-stone-800 dark:hover:text-brown-100 transition-colors duration-150">Mark all as read</button>
				)}
			</div>
			<hr className="border-stone-200 dark:border-dark-border mb-6" />
			<div className="max-w-lg bg-white dark:bg-dark-surface rounded-xl border border-stone-200 dark:border-dark-border overflow-hidden">
				{notifications.length === 0 && <p className="px-5 py-10 text-center text-sm text-stone-400 dark:text-brown-400">No notifications</p>}
				{notifications.map((n, i) => (
					<div key={n.id} className={`flex items-start gap-3 px-5 py-4 ${!n.isRead ? 'bg-stone-50 dark:bg-dark-elevated' : ''} ${i < notifications.length - 1 ? 'border-b border-stone-100 dark:border-dark-border' : ''}`}>
						<div className="w-10 h-10 rounded-full overflow-hidden bg-stone-200 dark:bg-dark-border shrink-0 mt-0.5">
							{n.actorAvatar ? <img src={n.actorAvatar} alt={n.actorName} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-300 dark:bg-dark-border" />}
						</div>
						<div className="flex-1">
							<p className="text-sm text-stone-700 dark:text-brown-100"><span className="font-semibold">{n.actorName}</span>{' '}{getNotifText(n)}</p>
							<p className="text-xs text-stone-400 dark:text-brown-400 mt-1">{new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
						</div>
						<div className="flex items-center gap-2 shrink-0 mt-1">
							{!n.isRead && <span className="w-2 h-2 bg-red-400 rounded-full" />}
							<button onClick={() => deleteNotification(n.id)} className="hover:opacity-60 transition-opacity duration-150">
								<img src={trashIcon} alt="Delete" className="w-4 h-4" />
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default AdminNotifications;
