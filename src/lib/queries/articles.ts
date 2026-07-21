// ── queries/articles.ts ───────────────────────────────────────────────
// Raw Supabase calls for articles — no mapping, no React state

import { supabase } from '../supabase';

const ARTICLE_SELECT = '*, profiles!author_id(display_name, avatar_url, username)' as const;

export const fetchArticles = () =>
	supabase
		.from('articles')
		.select(ARTICLE_SELECT)
		.order('created_at', { ascending: true });

export const fetchArticleById = (id: number) =>
	supabase
		.from('articles')
		.select(ARTICLE_SELECT)
		.eq('id', id)
		.single();
