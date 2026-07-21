// ── queries/likes.ts ──────────────────────────────────────────────────
// Raw Supabase calls for article_likes — no mapping, no React state

import { supabase } from '../supabase';

export const fetchArticleLikeCount = (articleId: number) =>
	supabase
		.from('article_likes')
		.select('*', { count: 'exact', head: true })
		.eq('article_id', articleId);

export const fetchArticleUserLike = (articleId: number, userId: string) =>
	supabase
		.from('article_likes')
		.select('user_id')
		.eq('article_id', articleId)
		.eq('user_id', userId)
		.maybeSingle();

export const insertArticleLike = (articleId: number, userId: string) =>
	supabase
		.from('article_likes')
		.insert({ article_id: articleId, user_id: userId });

export const deleteArticleLike = (articleId: number, userId: string) =>
	supabase
		.from('article_likes')
		.delete()
		.eq('article_id', articleId)
		.eq('user_id', userId);
