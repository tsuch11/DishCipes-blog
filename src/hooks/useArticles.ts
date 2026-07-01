// ── useArticles / useArticle ──────────────────────────────────────────
// Fetch articles from Supabase with author profile join

import { useState, useEffect, useCallback } from 'react';
import type { Article } from '../types/article';
import { supabase } from '../lib/supabase';

const formatDate = (iso: string) =>
	new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validUrl = (url: string | null | undefined) =>
	url && !url.startsWith('blob:') ? url : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapArticleRow = (a: any): Article => ({
	id: a.id,
	title: a.title,
	description: a.description,
	content: a.content ?? [],
	category: a.category,
	image: a.image ?? '',
	authorId: a.author_id ?? '',
	authorName: a.profiles?.display_name ?? 'Unknown',
	authorUsername: a.profiles?.username ?? '',
	authorAvatar: validUrl(a.profiles?.avatar_url) ?? '/images/icons/Teerapat.jpg',
	date: formatDate(a.created_at),
	readTime: a.read_time ?? 5,
	status: a.status ?? 'published',
});

export const useArticles = () => {
	const [articles, setArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);

	const refetch = useCallback(async () => {
		const { data } = await supabase
			.from('articles')
			.select('*, profiles!author_id(display_name, avatar_url, username)')
			.order('created_at', { ascending: true });
		if (data) setArticles(data.map(mapArticleRow));
		setLoading(false);
	}, []);

	useEffect(() => { refetch(); }, [refetch]);

	return { articles, loading, refetch };
};

export const useArticle = (id: number) => {
	const [article, setArticle] = useState<Article | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;
		supabase
			.from('articles')
			.select('*, profiles!author_id(display_name, avatar_url, username)')
			.eq('id', id)
			.single()
			.then(({ data }) => {
				if (data) setArticle(mapArticleRow(data));
				setLoading(false);
			});
	}, [id]);

	return { article, loading };
};
