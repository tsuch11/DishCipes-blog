// ── useArticleLikes ───────────────────────────────────────────────────
// Manage like state and toggle for a single article

import { useState, useEffect } from 'react';
import {
	fetchArticleLikeCount,
	fetchArticleUserLike,
	insertArticleLike,
	deleteArticleLike,
} from '../lib/queries/likes';

export const useArticleLikes = (articleId: number, userId?: string) => {
	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(0);

	useEffect(() => {
		if (!articleId) return;
		fetchArticleLikeCount(articleId).then(({ count }) => setLikeCount(count ?? 0));
		if (userId) {
			fetchArticleUserLike(articleId, userId).then(({ data }) => setLiked(!!data));
		}
	}, [articleId, userId]);

	const toggle = async (onUnauthenticated: () => void) => {
		if (!userId) { onUnauthenticated(); return; }
		if (liked) {
			await deleteArticleLike(articleId, userId);
			setLiked(false);
			setLikeCount((prev) => prev - 1);
		} else {
			await insertArticleLike(articleId, userId);
			setLiked(true);
			setLikeCount((prev) => prev + 1);
		}
	};

	return { liked, likeCount, toggle };
};
