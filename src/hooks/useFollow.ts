// ── useFollow ─────────────────────────────────────────────────────────
// Toggle follow state for a target user profile

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useFollow = (targetUserId: string) => {
	const { user, isAuthenticated } = useAuth();
	const [isFollowing, setIsFollowing] = useState(false);
	const [followerCount, setFollowerCount] = useState(0);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!targetUserId) return;
		supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetUserId)
			.then(({ count }) => setFollowerCount(count ?? 0));
		if (user) {
			supabase.from('follows').select('follower_id').eq('follower_id', user.id).eq('following_id', targetUserId).maybeSingle()
				.then(({ data }) => setIsFollowing(!!data));
		} else {
			setIsFollowing(false);
		}
	}, [targetUserId, user?.id]);

	const toggle = async () => {
		if (!isAuthenticated || !user || !targetUserId) return;
		setLoading(true);
		if (isFollowing) {
			await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
			setIsFollowing(false);
			setFollowerCount((prev) => prev - 1);
		} else {
			await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId });
			setIsFollowing(true);
			setFollowerCount((prev) => prev + 1);
		}
		setLoading(false);
	};

	return { isFollowing, followerCount, toggle, loading };
};
