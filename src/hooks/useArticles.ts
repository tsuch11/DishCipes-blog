// ── useArticles / useArticle ──────────────────────────────────────────
// Fetch articles from Supabase with author profile join

import { useState, useEffect } from 'react';
import type { Article } from '../types/article';
import { supabase } from '../lib/supabase';

const formatDate = (iso: string) =>
	new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validUrl = (url: string | null | undefined) =>
	url && !url.startsWith('blob:') ? url : null;

const mapRow = (a: any): Article => ({
	id: a.id,
	title: a.title,
	description: a.description,
	content: a.content ?? [],
	category: a.category,
	image: a.image ?? '',
	authorName: a.profiles?.display_name ?? 'Unknown',
	authorAvatar: validUrl(a.profiles?.avatar_url) ?? '/images/icons/Teerapat.jpg',
	date: formatDate(a.created_at),
	readTime: a.read_time ?? 5,
});

export const useArticles = () => {
	const [articles, setArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		supabase
			.from('articles')
			.select('*, profiles!author_id(display_name, avatar_url)')
			.order('created_at', { ascending: true })
			.then(({ data }) => {
				if (data) setArticles(data.map(mapRow));
				setLoading(false);
			});
	}, []);

	return { articles, loading };
};

export const useArticle = (id: number) => {
	const [article, setArticle] = useState<Article | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;
		supabase
			.from('articles')
			.select('*, profiles!author_id(display_name, avatar_url)')
			.eq('id', id)
			.single()
			.then(({ data }) => {
				if (data) setArticle(mapRow(data));
				setLoading(false);
			});
	}, [id]);

	return { article, loading };
};
