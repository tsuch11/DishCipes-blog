// ── useArticleLikes ───────────────────────────────────────────────────
// Manage like state and toggle for a single article

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useArticleLikes = (articleId: number, userId?: string) => {
	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(0);

	useEffect(() => {
		if (!articleId) return;
		supabase.from('article_likes').select('*', { count: 'exact', head: true }).eq('article_id', articleId)
			.then(({ count }) => setLikeCount(count ?? 0));
		if (userId) {
			supabase.from('article_likes').select('user_id').eq('article_id', articleId).eq('user_id', userId).maybeSingle()
				.then(({ data }) => setLiked(!!data));
		}
	}, [articleId, userId]);

	const toggle = async (onUnauthenticated: () => void) => {
		if (!userId) { onUnauthenticated(); return; }
		if (liked) {
			await supabase.from('article_likes').delete().eq('article_id', articleId).eq('user_id', userId);
			setLiked(false);
			setLikeCount((prev) => prev - 1);
		} else {
			await supabase.from('article_likes').insert({ article_id: articleId, user_id: userId });
			setLiked(true);
			setLikeCount((prev) => prev + 1);
		}
	};

	return { liked, likeCount, toggle };
};
