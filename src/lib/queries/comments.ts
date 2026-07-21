// ── queries/comments.ts ───────────────────────────────────────────────
// Raw Supabase calls for comments, replies, and their likes

import { supabase } from '../supabase';

const COMMENT_SELECT = [
	'id, text, created_at, user_id',
	'profiles!user_id(display_name, avatar_url, username)',
	'replies(id, text, created_at, user_id, profiles!user_id(display_name, avatar_url, username), reply_likes(user_id))',
	'comment_likes(user_id)',
].join(', ') as const;

export const fetchComments = (articleId: number) =>
	supabase
		.from('comments')
		.select(COMMENT_SELECT)
		.eq('article_id', articleId)
		.order('created_at', { ascending: true });

export const insertComment = (articleId: number, userId: string, text: string) =>
	supabase
		.from('comments')
		.insert({ article_id: articleId, user_id: userId, text })
		.select('id, text, created_at')
		.single();

export const updateComment = (commentId: number, text: string) =>
	supabase
		.from('comments')
		.update({ text })
		.eq('id', commentId);

export const deleteComment = (commentId: number) =>
	supabase
		.from('comments')
		.delete()
		.eq('id', commentId);

export const insertCommentLike = (commentId: number, userId: string) =>
	supabase
		.from('comment_likes')
		.insert({ comment_id: commentId, user_id: userId });

export const deleteCommentLike = (commentId: number, userId: string) =>
	supabase
		.from('comment_likes')
		.delete()
		.eq('comment_id', commentId)
		.eq('user_id', userId);

export const insertReply = (commentId: number, userId: string, text: string, replyToUserId: string | null) =>
	supabase
		.from('replies')
		.insert({ comment_id: commentId, user_id: userId, text, reply_to_user_id: replyToUserId || null });

export const updateReply = (replyId: number, text: string) =>
	supabase
		.from('replies')
		.update({ text })
		.eq('id', replyId);

export const deleteReply = (replyId: number) =>
	supabase
		.from('replies')
		.delete()
		.eq('id', replyId);

export const insertReplyLike = (replyId: number, userId: string) =>
	supabase
		.from('reply_likes')
		.insert({ reply_id: replyId, user_id: userId });

export const deleteReplyLike = (replyId: number, userId: string) =>
	supabase
		.from('reply_likes')
		.delete()
		.eq('reply_id', replyId)
		.eq('user_id', userId);
