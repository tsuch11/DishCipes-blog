// ── Notification Types ─────────────────────────────────────────────────

export type NotificationType = 'comment' | 'reply' | 'article_like' | 'comment_like' | 'follow' | 'new_article';

export type Notification = {
	id: number;
	type: NotificationType;
	actorName: string;
	actorAvatar: string;
	actorUsername: string;
	articleId: number | null;
	articleTitle: string | null;
	commentId: number | null;
	isRead: boolean;
	createdAt: string;
};
