// ── queries/follows.ts ────────────────────────────────────────────────
// Raw Supabase calls for follows — no mapping, no React state

import { supabase } from '../supabase';

export const fetchFollowerCount = (targetUserId: string) =>
	supabase
		.from('follows')
		.select('*', { count: 'exact', head: true })
		.eq('following_id', targetUserId);

export const fetchIsFollowing = (followerId: string, followingId: string) =>
	supabase
		.from('follows')
		.select('follower_id')
		.eq('follower_id', followerId)
		.eq('following_id', followingId)
		.maybeSingle();

export const insertFollow = (followerId: string, followingId: string) =>
	supabase
		.from('follows')
		.insert({ follower_id: followerId, following_id: followingId });

export const deleteFollow = (followerId: string, followingId: string) =>
	supabase
		.from('follows')
		.delete()
		.eq('follower_id', followerId)
		.eq('following_id', followingId);
