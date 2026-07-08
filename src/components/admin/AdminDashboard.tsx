// ── AdminDashboard ────────────────────────────────────────────────────
// Analytics dashboard with stat cards, charts, and top articles

import { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useArticles } from '../../hooks/useArticles';
import { supabase } from '../../lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────
type DashboardData = {
	totalArticles: number;
	totalUsers: number;
	totalComments: number;
	totalLikes: number;
	categoryData: { name: string; value: number }[];
	commentsPerDay: { date: string; count: number }[];
	topArticles: { id: number; title: string; image: string; likes: number }[];
};

const CHART_COLORS = ['#5C8A4A', '#8B6B47', '#D4956A', '#6B8B6B', '#A0856B', '#4A7A5C', '#C4A882'];

// ── Component ─────────────────────────────────────────────────────────
const AdminDashboard = () => {
	const { articles: fetchedArticles } = useArticles();
	const [dashboard, setDashboard] = useState<DashboardData | null>(null);

	const fetchDashboard = useCallback(async () => {
		const [{ count: totalArticles }, { count: totalUsers }, { count: totalComments }, { count: totalLikes }] = await Promise.all([
			supabase.from('articles').select('*', { count: 'exact', head: true }),
			supabase.from('profiles').select('*', { count: 'exact', head: true }),
			supabase.from('comments').select('*', { count: 'exact', head: true }),
			supabase.from('article_likes').select('*', { count: 'exact', head: true }),
		]);

		const catMap: Record<string, number> = {};
		fetchedArticles.forEach((a) => { catMap[a.category] = (catMap[a.category] ?? 0) + 1; });
		const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
		const { data: commentRows } = await supabase.from('comments').select('created_at').gte('created_at', sevenDaysAgo);
		const dayMap: Record<string, number> = {};
		for (let i = 6; i >= 0; i--) {
			const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
			dayMap[d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })] = 0;
		}
		commentRows?.forEach((c) => {
			const key = new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
			if (key in dayMap) dayMap[key]++;
		});
		const commentsPerDay = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

		const { data: likeRows } = await supabase.from('article_likes').select('article_id');
		const likeCount: Record<number, number> = {};
		likeRows?.forEach((r) => { likeCount[r.article_id] = (likeCount[r.article_id] ?? 0) + 1; });
		const topArticles = [...fetchedArticles]
			.map((a) => ({ id: a.id, title: a.title, image: a.image, likes: likeCount[a.id] ?? 0 }))
			.sort((a, b) => b.likes - a.likes)
			.slice(0, 5);

		setDashboard({ totalArticles: totalArticles ?? 0, totalUsers: totalUsers ?? 0, totalComments: totalComments ?? 0, totalLikes: totalLikes ?? 0, categoryData, commentsPerDay, topArticles });
	}, [fetchedArticles]);

	useEffect(() => {
		if (fetchedArticles.length > 0) fetchDashboard();
	}, [fetchedArticles, fetchDashboard]);

	return (
		<div className="px-4 py-6 md:px-12 md:py-8">
			<h1 className="text-xl font-bold text-stone-800 dark:text-brown-100 mb-6">Dashboard</h1>
			<hr className="border-stone-200 dark:border-dark-border mb-6" />
			{!dashboard ? (
				<p className="text-sm text-stone-400 dark:text-brown-400">Loading...</p>
			) : (
				<div className="flex flex-col gap-6">
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						{[
							{ label: 'Total Articles', value: dashboard.totalArticles },
							{ label: 'Total Users', value: dashboard.totalUsers },
							{ label: 'Total Comments', value: dashboard.totalComments },
							{ label: 'Total Likes', value: dashboard.totalLikes },
						].map(({ label, value }) => (
							<div key={label} className="bg-white dark:bg-dark-surface rounded-xl border border-stone-200 dark:border-dark-border px-5 py-4">
								<p className="text-xs text-stone-400 dark:text-brown-400 mb-1">{label}</p>
								<p className="text-3xl font-bold text-stone-800 dark:text-brown-100">{value}</p>
							</div>
						))}
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="bg-white dark:bg-dark-surface rounded-xl border border-stone-200 dark:border-dark-border p-5">
							<p className="text-sm font-semibold text-stone-700 dark:text-brown-100 mb-4">Articles by category</p>
							<ResponsiveContainer width="100%" height={220}>
								<PieChart>
									<Pie data={dashboard.categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
										{dashboard.categoryData.map((_, i) => (
											<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
										))}
									</Pie>
									<Tooltip />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
						<div className="bg-white dark:bg-dark-surface rounded-xl border border-stone-200 dark:border-dark-border p-5">
							<p className="text-sm font-semibold text-stone-700 dark:text-brown-100 mb-4">Comments — last 7 days</p>
							<ResponsiveContainer width="100%" height={220}>
								<LineChart data={dashboard.commentsPerDay}>
									<CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
									<XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a8a29e' }} />
									<YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#a8a29e' }} />
									<Tooltip />
									<Line type="monotone" dataKey="count" stroke="#5C8A4A" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
								</LineChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="bg-white dark:bg-dark-surface rounded-xl border border-stone-200 dark:border-dark-border overflow-hidden">
						<div className="px-5 py-4 border-b border-stone-100 dark:border-dark-border">
							<p className="text-sm font-semibold text-stone-700 dark:text-brown-100">Top articles by likes</p>
						</div>
						{dashboard.topArticles.length === 0 && <p className="px-5 py-8 text-center text-sm text-stone-400 dark:text-brown-400">No data</p>}
						{dashboard.topArticles.map((a, i) => (
							<div key={a.id} className={`flex items-center gap-4 px-5 py-3.5 ${i < dashboard.topArticles.length - 1 ? 'border-b border-stone-100 dark:border-dark-border' : ''}`}>
								<span className="text-lg font-bold text-stone-300 dark:text-dark-border w-6 shrink-0">{i + 1}</span>
								<div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-dark-elevated overflow-hidden shrink-0">
									{a.image && <img src={a.image} alt={a.title} className="w-full h-full object-cover" />}
								</div>
								<p className="flex-1 text-sm text-stone-700 dark:text-brown-100 line-clamp-1">{a.title}</p>
								<span className="text-sm text-stone-400 dark:text-brown-400 shrink-0">{a.likes} likes</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminDashboard;
