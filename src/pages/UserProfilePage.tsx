// ── UserProfilePage ───────────────────────────────────────────────────
// Public profile page for any user (route: /user/:username)
// แก้ไขได้: avatar size, follower label, articles grid columns

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../hooks/useFollow';
import { mapArticleRow } from '../hooks/useArticles';
import type { Article } from '../types/article';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ArticleCard from '../components/shared/ArticleCard';

// ── Types ──────────────────────────────────────────────────────────────
type ProfileData = {
	id: string;
	display_name: string | null;
	username: string | null;
	avatar_url: string | null;
	bio: string | null;
};

// ── Component ──────────────────────────────────────────────────────────
const UserProfilePage = () => {
	const { username } = useParams<{ username: string }>();
	const { user: currentUser, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [articles, setArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);

	const { isFollowing, followerCount, toggle: toggleFollow, loading: followLoading } = useFollow(profile?.id ?? '');

	// ── Fetch ─────────────────────────────────────────────────────────
	useEffect(() => {
		if (!username) return;
		setLoading(true);
		supabase.from('profiles').select('id, display_name, username, avatar_url, bio').eq('username', username).single()
			.then(async ({ data: profileData }) => {
				if (!profileData) { navigate('/'); return; }
				setProfile(profileData);
				const { data: arts } = await supabase
					.from('articles')
					.select('*, profiles!author_id(display_name, avatar_url, username)')
					.eq('author_id', profileData.id)
					.order('created_at', { ascending: false });
				if (arts) setArticles(arts.map(mapArticleRow));
				setLoading(false);
			});
	}, [username]);

	// ── Render ────────────────────────────────────────────────────────
	const isOwnProfile = currentUser?.id === profile?.id;

	if (loading) {
		return (
			<div className="min-h-screen flex flex-col font-sans dark:bg-dark-bg">
				<Navbar />
				<main className="flex-1 flex items-center justify-center">
					<p className="text-brown-400 dark:text-brown-300 text-sm">Loading...</p>
				</main>
				<Footer />
			</div>
		);
	}

	if (!profile) return null;

	return (
		<div className="min-h-screen flex flex-col font-sans dark:bg-dark-bg">
			<Navbar />

			<main className="flex-1 animate-pageFade">
				<div className="max-w-7xl mx-auto px-4 pt-6 pb-16 md:px-10">
					<button
						onClick={() => navigate(-1)}
						className="inline-flex items-center gap-1.5 text-sm text-brown-400 dark:text-brown-300 hover:text-brown-600 dark:hover:text-brown-100 transition-colors duration-150 mb-8"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						Back
					</button>

					{/* ── Profile header ── */}
					<div className="flex flex-col gap-6 mb-10 sm:flex-row sm:items-start sm:gap-8">
						<div className="w-24 h-24 rounded-full bg-brown-300 dark:bg-dark-elevated overflow-hidden shrink-0">
							{profile.avatar_url ? (
								<img src={profile.avatar_url} alt={profile.display_name ?? ''} className="w-full h-full object-cover" />
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<svg className="w-10 h-10 text-brown-500 dark:text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
							)}
						</div>

						<div className="flex-1 min-w-0">
							<h1 className="text-2xl font-bold text-brown-600 dark:text-brown-100 mb-0.5">{profile.display_name ?? username}</h1>
							<p className="text-sm text-brown-400 dark:text-brown-300 mb-3">@{profile.username}</p>
							{profile.bio && (
								<p className="text-sm text-brown-500 dark:text-brown-200 leading-relaxed mb-4 max-w-lg">{profile.bio}</p>
							)}

							<div className="flex items-center gap-5">
								<span className="text-sm text-brown-500 dark:text-brown-200">
									<span className="font-semibold text-brown-600 dark:text-brown-100">{followerCount}</span>{' '}Followers
								</span>
								<span className="text-sm text-brown-500 dark:text-brown-200">
									<span className="font-semibold text-brown-600 dark:text-brown-100">{articles.length}</span>{' '}Articles
								</span>
							</div>
						</div>

						{/* ── Follow / Edit button ── */}
						<div className="sm:shrink-0 w-full sm:w-auto">
							{isOwnProfile ? (
								<Link
									to="/profile"
									className="inline-flex justify-center w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-brown-600 dark:text-brown-100 border border-brown-400 dark:border-dark-border rounded-full hover:bg-brown-100 dark:hover:bg-dark-elevated active:scale-95 transition-all duration-150"
								>
									Edit profile
								</Link>
							) : (
								<button
									onClick={isAuthenticated ? toggleFollow : () => navigate('/login')}
									disabled={followLoading}
									className={`w-full sm:w-auto px-6 py-2.5 text-sm font-medium rounded-full active:scale-95 transition-all duration-150 disabled:opacity-60 ${isFollowing ? 'text-brown-600 dark:text-brown-100 border border-brown-400 dark:border-dark-border hover:bg-brown-100 dark:hover:bg-dark-elevated' : 'text-white bg-brown-600 hover:bg-brown-500'}`}
								>
									{isFollowing ? 'Following' : 'Follow'}
								</button>
							)}
						</div>
					</div>

					{/* ── Articles ── */}
					<div>
						<h2 className="text-lg font-bold text-brown-600 dark:text-brown-100 mb-5">Articles</h2>
						{articles.length === 0 ? (
							<p className="text-sm text-brown-300 dark:text-brown-400 py-8">No articles yet.</p>
						) : (
							<div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-6">
								{articles.map((article) => (
									<ArticleCard key={article.id} article={article} />
								))}
							</div>
						)}
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default UserProfilePage;
