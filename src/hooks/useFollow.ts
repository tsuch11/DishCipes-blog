// ── useFollow ─────────────────────────────────────────────────────────
// Toggle follow state for a target user profile

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
	fetchFollowerCount,
	fetchIsFollowing,
	insertFollow,
	deleteFollow,
} from '../lib/queries/follows';

export const useFollow = (targetUserId: string) => {
	const { user, isAuthenticated } = useAuth();
	const [isFollowing, setIsFollowing] = useState(false);
	const [followerCount, setFollowerCount] = useState(0);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!targetUserId) return;
		fetchFollowerCount(targetUserId).then(({ count }) => setFollowerCount(count ?? 0));
		if (user) {
			fetchIsFollowing(user.id, targetUserId).then(({ data }) => setIsFollowing(!!data));
		} else {
			setIsFollowing(false);
		}
	}, [targetUserId, user?.id]);

	const toggle = async () => {
		if (!isAuthenticated || !user || !targetUserId) return;
		setLoading(true);
		if (isFollowing) {
			await deleteFollow(user.id, targetUserId);
			setIsFollowing(false);
			setFollowerCount((prev) => prev - 1);
		} else {
			await insertFollow(user.id, targetUserId);
			setIsFollowing(true);
			setFollowerCount((prev) => prev + 1);
		}
		setLoading(false);
	};

	return { isFollowing, followerCount, toggle, loading };
};
