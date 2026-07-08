// ── useComments ───────────────────────────────────────────────────────
// Fetch and mutate comments and replies for a single article

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Comment } from '../types/comment';

const fmtDate = (iso: string) => {
	const d = new Date(iso);
	return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
		+ ' at ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

export const useComments = (articleId: number, userId?: string) => {
	const [comments, setComments] = useState<Comment[]>([]);

	const fetchComments = useCallback(async () => {
		const { data } = await supabase
			.from('comments')
			.select('id, text, created_at, user_id, profiles!user_id(display_name, avatar_url, username), replies(id, text, created_at, user_id, profiles!user_id(display_name, avatar_url, username), reply_likes(user_id)), comment_likes(user_id)')
			.eq('article_id', articleId)
			.order('created_at', { ascending: true });
		if (!data) return;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		setComments(data.map((c: any) => ({
			id: c.id,
			userId: c.user_id ?? '',
			name: c.profiles?.display_name ?? 'Unknown',
			username: c.profiles?.username ?? '',
			date: fmtDate(c.created_at),
			avatar: c.profiles?.avatar_url ?? '',
			text: c.text,
			likes: c.comment_likes?.length ?? 0,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			likedByMe: userId ? (c.comment_likes?.some((l: any) => l.user_id === userId) ?? false) : false,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			replies: [...(c.replies ?? [])].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((r: any) => ({
				id: r.id,
				userId: r.user_id ?? '',
				name: r.profiles?.display_name ?? 'Unknown',
				username: r.profiles?.username ?? '',
				date: fmtDate(r.created_at),
				avatar: r.profiles?.avatar_url ?? '',
				text: r.text,
				likes: r.reply_likes?.length ?? 0,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				likedByMe: userId ? (r.reply_likes?.some((l: any) => l.user_id === userId) ?? false) : false,
			})),
		})));
	}, [articleId, userId]);

	useEffect(() => { fetchComments(); }, [fetchComments]);

	const sendComment = async (text: string, displayName: string, username: string, avatar: string, onUnauthenticated: () => void) => {
		if (!userId) { onUnauthenticated(); return; }
		const { data } = await supabase
			.from('comments')
			.insert({ article_id: articleId, user_id: userId, text })
			.select('id, text, created_at')
			.single();
		if (!data) return;
		const newComment: Comment = {
			id: data.id,
			userId,
			name: displayName,
			username,
			date: fmtDate(data.created_at),
			avatar,
			text: data.text,
			likes: 0,
			likedByMe: false,
			replies: [],
		};
		setComments((prev) => [...prev, newComment]);
	};

	const likeComment = async (commentId: number, onUnauthenticated: () => void) => {
		if (!userId) { onUnauthenticated(); return; }
		const comment = comments.find((c) => c.id === commentId);
		if (!comment) return;
		if (comment.likedByMe) {
			await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', userId);
			setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, likedByMe: false, likes: c.likes - 1 } : c));
		} else {
			await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: userId });
			setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, likedByMe: true, likes: c.likes + 1 } : c));
		}
	};

	const editComment = async (commentId: number, newText: string) => {
		await supabase.from('comments').update({ text: newText }).eq('id', commentId);
		setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, text: newText } : c));
	};

	const deleteComment = async (commentId: number) => {
		await supabase.from('comments').delete().eq('id', commentId);
		setComments((prev) => prev.filter((c) => c.id !== commentId));
	};

	const sendReply = async (commentId: number, text: string, replyToUserId: string | null, onUnauthenticated: () => void) => {
		if (!userId) { onUnauthenticated(); return; }
		const { error } = await supabase
			.from('replies')
			.insert({ comment_id: commentId, user_id: userId, text, reply_to_user_id: replyToUserId || null });
		if (error) { console.error('Reply insert error:', error); return; }
		await fetchComments();
	};

	const likeReply = async (replyId: number, commentId: number, onUnauthenticated: () => void) => {
		if (!userId) { onUnauthenticated(); return; }
		const reply = comments.find((c) => c.id === commentId)?.replies.find((r) => r.id === replyId);
		if (!reply) return;
		const update = (isLiked: boolean) =>
			setComments((prev) => prev.map((c) => c.id === commentId
				? { ...c, replies: c.replies.map((r) => r.id === replyId ? { ...r, likedByMe: isLiked, likes: r.likes + (isLiked ? 1 : -1) } : r) }
				: c
			));
		if (reply.likedByMe) {
			await supabase.from('reply_likes').delete().eq('reply_id', replyId).eq('user_id', userId);
			update(false);
		} else {
			await supabase.from('reply_likes').insert({ reply_id: replyId, user_id: userId });
			update(true);
		}
	};

	const editReply = async (replyId: number, commentId: number, newText: string) => {
		await supabase.from('replies').update({ text: newText }).eq('id', replyId);
		setComments((prev) => prev.map((c) => c.id === commentId
			? { ...c, replies: c.replies.map((r) => r.id === replyId ? { ...r, text: newText } : r) }
			: c
		));
	};

	const deleteReply = async (replyId: number, commentId: number) => {
		await supabase.from('replies').delete().eq('id', replyId);
		setComments((prev) => prev.map((c) => c.id === commentId
			? { ...c, replies: c.replies.filter((r) => r.id !== replyId) }
			: c
		));
	};

	return {
		comments,
		sendComment,
		likeComment,
		editComment,
		deleteComment,
		sendReply,
		likeReply,
		editReply,
		deleteReply,
	};
};
