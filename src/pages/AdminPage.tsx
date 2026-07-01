// ── AdminPage ─────────────────────────────────────────────────────────
// Admin panel (route: /admin) — no Navbar, uses AdminSidebar instead
// แก้ไขได้: views (articles, categories, notifications, profile, reset-password), toast messages

import { useState, useRef, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useArticles } from '../hooks/useArticles';
import { useNotifications } from '../hooks/useNotifications';
import { supabase } from '../lib/supabase';
import type { Notification } from '../types/notification';
import AdminSidebar from '../components/admin/AdminSidebar';
import type { AdminView } from '../components/admin/AdminSidebar';
import ConfirmModal from '../components/ui/ConfirmModal';
import Toast from '../components/ui/Toast';
import addIcon from '../assets/images/icons/Add_round_light.svg';
import searchIcon from '../assets/images/icons/Search_light.svg';
import editIcon from '../assets/images/icons/Edit_light.svg';
import trashIcon from '../assets/images/icons/Trash_light.svg';
import expandDownIcon from '../assets/images/icons/Expand_down_light.svg';

type AdminArticle = {
	id: number;
	image: string;
	category: string;
	title: string;
	description: string;
	authorName: string;
	authorAvatar: string;
	date: string;
	readTime: number;
	content: string[];
	status: 'published' | 'draft';
};

type ArticleForm = {
	image: string;
	category: string;
	authorName: string;
	title: string;
	description: string;
	content: string;
};

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

const AdminPage = () => {
	const { user, isAuthenticated, logout, updateProfile, resetPassword } = useAuth();
	const navigate = useNavigate();
	const { articles: fetchedArticles, refetch: refetchArticles } = useArticles();
	const { notifications, markAllRead, deleteNotification } = useNotifications();

	const [view, setView] = useState<AdminView>('articles');
	const [articleSubview, setArticleSubview] = useState<'list' | 'create' | 'edit'>('list');
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const [adminArticles, setAdminArticles] = useState<AdminArticle[]>([]);
	const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null);
	const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
	const [categoryFilter, setCategoryFilter] = useState('all');
	const [form, setForm] = useState<ArticleForm>({ image: '', category: '', authorName: '', title: '', description: '', content: '' });
	const [toast, setToast] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' });
	const thumbnailRef = useRef<HTMLInputElement>(null);

	const [categories, setCategories] = useState<string[]>([]);

	type AdminUser = { id: string; displayName: string; username: string; email: string; role: string; avatarUrl: string; isBanned: boolean; };
	const [users, setUsers] = useState<AdminUser[]>([]);

	const fetchUsers = () => {
		supabase.from('profiles').select('id, display_name, username, email, role, avatar_url, is_banned').order('created_at', { ascending: false }).then(({ data }) => {
			if (data) setUsers(data.map((u) => ({ id: u.id, displayName: u.display_name, username: u.username, email: u.email, role: u.role, avatarUrl: u.avatar_url ?? '', isBanned: u.is_banned ?? false })));
		});
	};

	useEffect(() => { fetchUsers(); }, []);

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
		if (view === 'analytics' && fetchedArticles.length > 0) fetchDashboard();
	}, [view, fetchedArticles, fetchDashboard]);

	const [promoteTargetId, setPromoteTargetId] = useState<string | null>(null);
	const [demoteTargetId, setDemoteTargetId] = useState<string | null>(null);

	const handlePromoteConfirm = async () => {
		if (!promoteTargetId) return;
		await supabase.from('profiles').update({ role: 'admin' }).eq('id', promoteTargetId);
		setPromoteTargetId(null);
		fetchUsers();
	};

	const handleDemoteConfirm = async () => {
		if (!demoteTargetId) return;
		await supabase.from('profiles').update({ role: 'member' }).eq('id', demoteTargetId);
		setDemoteTargetId(null);
		fetchUsers();
	};

	const handleToggleBan = async (id: string, current: boolean) => {
		await supabase.from('profiles').update({ is_banned: !current }).eq('id', id);
		fetchUsers();
	};

	const fetchCategories = () => {
		supabase.from('categories').select('name').order('name').then(({ data }) => {
			if (data) setCategories(data.map((c) => c.name));
		});
	};

	useEffect(() => { fetchCategories(); }, []);

	useEffect(() => {
		if (fetchedArticles.length === 0) return;
		setAdminArticles(fetchedArticles.map(a => ({ ...a, status: (a.status ?? 'published') as 'published' | 'draft', readTime: a.readTime ?? 5, content: a.content ?? [] })));
	}, [fetchedArticles]);
	const [openMenuId, setOpenMenuId] = useState<number | null>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (!(e.target as Element).closest('[data-row-menu]')) setOpenMenuId(null);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);
	const [newCategory, setNewCategory] = useState('');

	const [profileName, setProfileName] = useState(user?.name ?? '');
	const [profileUsername, setProfileUsername] = useState(user?.username ?? '');
	const [profileAvatar, setProfileAvatar] = useState(user?.avatar ?? '');
	const [profileBio, setProfileBio] = useState(user?.bio ?? '');
	const profileAvatarRef = useRef<HTMLInputElement>(null);

	const [resetCurrent, setResetCurrent] = useState('');
	const [resetNew, setResetNew] = useState('');
	const [resetConfirm, setResetConfirm] = useState('');
	const [resetErrors, setResetErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (!isAuthenticated || !user || user.role !== 'admin') {
			navigate('/admin/login');
		}
	}, [isAuthenticated, user, navigate]);

	if (!isAuthenticated || !user || user.role !== 'admin') return null;

	const showToast = (title: string, message: string) => {
		setToast({ show: true, title, message });
		setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
	};

	const openCreate = () => {
		setForm({ image: '', category: categories[0] ?? '', authorName: user.name, title: '', description: '', content: '' });
		setEditingArticle(null);
		setArticleSubview('create');
	};

	const openEdit = (article: AdminArticle) => {
		setEditingArticle(article);
		setForm({ image: article.image, category: article.category, authorName: article.authorName, title: article.title, description: article.description, content: article.content.join('\n\n') });
		setArticleSubview('edit');
	};

	const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const ext = file.name.split('.').pop() ?? 'jpg';
		const path = `thumbnails/${Date.now()}.${ext}`;
		const { error } = await supabase.storage.from('article-images').upload(path, file);
		if (error) { console.error('Upload error:', error); return; }
		const { data } = supabase.storage.from('article-images').getPublicUrl(path);
		setForm(prev => ({ ...prev, image: data.publicUrl }));
	};

	const buildPayload = (status: 'published' | 'draft') => ({
		title: form.title,
		description: form.description,
		content: form.content ? form.content.split('\n\n').filter(Boolean) : [],
		category: form.category,
		image: form.image,
		read_time: Math.max(1, Math.ceil(form.content.split(' ').length / 200)),
		status,
	});

	const handleSaveDraft = async () => {
		const payload = buildPayload('draft');
		if (articleSubview === 'edit' && editingArticle) {
			const { error } = await supabase.from('articles').update(payload).eq('id', editingArticle.id);
			if (error) { console.error(error); return; }
		} else {
			const { error } = await supabase.from('articles').insert({ ...payload, author_id: user.id });
			if (error) { console.error(error); return; }
		}
		await refetchArticles();
		setArticleSubview('list');
		showToast('Saved as draft', 'You can publish the article later');
	};

	const handleSavePublish = async () => {
		const payload = buildPayload('published');
		if (articleSubview === 'edit' && editingArticle) {
			const { error } = await supabase.from('articles').update(payload).eq('id', editingArticle.id);
			if (error) { console.error(error); return; }
			showToast('Article updated', 'Your article has been successfully updated');
		} else {
			const { error } = await supabase.from('articles').insert({ ...payload, author_id: user.id });
			if (error) { console.error(error); return; }
			showToast('Article published', 'Your article has been successfully published');
		}
		await refetchArticles();
		setArticleSubview('list');
	};

	const handleDeleteConfirm = async () => {
		if (deleteTargetId === null) return;
		const { error } = await supabase.from('articles').delete().eq('id', deleteTargetId);
		if (error) { console.error(error); return; }
		await refetchArticles();
		setDeleteTargetId(null);
		if (articleSubview === 'edit') setArticleSubview('list');
		showToast('Article deleted', 'The article has been removed');
	};

	const filteredArticles = adminArticles
		.filter(a => (searchQuery ? a.title.toLowerCase().includes(searchQuery.toLowerCase()) : true))
		.filter(a => (statusFilter !== 'all' ? a.status === statusFilter : true))
		.filter(a => (categoryFilter !== 'all' ? a.category === categoryFilter : true));

	const handleLogout = () => { logout(); navigate('/'); };
	const handleNavigate = (v: AdminView) => { setView(v); if (v === 'articles') setArticleSubview('list'); };

	const handleProfileAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const ext = file.name.split('.').pop() ?? 'jpg';
		const path = `${user.id}.${ext}`;
		const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
		if (error) { console.error(error); return; }
		const { data } = supabase.storage.from('avatars').getPublicUrl(path);
		setProfileAvatar(data.publicUrl);
	};

	const handleProfileSave = async (e: React.FormEvent) => {
		e.preventDefault();
		await updateProfile({ name: profileName, username: profileUsername, avatar: profileAvatar, bio: profileBio });
		showToast('Profile updated', 'Your profile has been successfully updated');
	};

	const handleResetSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const errs: Record<string, string> = {};
		if (!resetCurrent) errs.current = 'Current password is required.';
		if (resetNew.length < 8) errs.new = 'Password must be at least 8 characters.';
		if (resetNew !== resetConfirm) errs.confirm = 'Passwords do not match.';
		if (Object.keys(errs).length > 0) { setResetErrors(errs); return; }
		setResetErrors({});
		const result = await resetPassword(resetCurrent, resetNew);
		if (result.success) {
			setResetCurrent(''); setResetNew(''); setResetConfirm('');
			showToast('Password updated', 'Your password has been successfully updated');
		} else {
			setResetErrors({ current: result.message });
		}
	};

	const getNotifText = (n: Notification) => {
		switch (n.type) {
			case 'comment': return `commented on "${n.articleTitle}"`;
			case 'reply': return 'replied to your comment';
			case 'article_like': return `liked "${n.articleTitle}"`;
			case 'comment_like': return 'liked your comment';
			case 'follow': return 'followed you';
			case 'new_article': return `published "${n.articleTitle}"`;
			case 'new_user': return 'just joined DishCipes';
			default: return '';
		}
	};

	const inputCls = (err?: boolean) =>
		`w-full px-4 py-3 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border rounded-xl outline-none placeholder:text-stone-300 dark:placeholder:text-brown-400 transition-colors duration-150 ${err ? 'border-red-400' : 'border-stone-200 dark:border-dark-border focus:border-stone-400 dark:focus:border-dark-border'}`;

	return (
		<div className="h-screen bg-brown-100 dark:bg-dark-bg font-sans flex overflow-hidden">
			<AdminSidebar
				activeView={view}
				onNavigate={handleNavigate}
				onLogout={handleLogout}
				mobileOpen={mobileSidebarOpen}
				onMobileClose={() => setMobileSidebarOpen(false)}
			/>

			<main className="flex-1 overflow-y-auto">
				{/* ── Mobile topbar ── */}
				<div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-brown-300 dark:border-dark-border bg-brown-100 dark:bg-dark-bg sticky top-0 z-30">
					<button
						onClick={() => setMobileSidebarOpen(true)}
						className="w-9 h-9 flex flex-col justify-center items-center gap-1.5 rounded-lg hover:bg-brown-200 dark:hover:bg-dark-elevated active:scale-90 transition-all duration-150"
					>
						<span className="block w-5 h-0.5 bg-stone-600 dark:bg-brown-300 rounded-full" />
						<span className="block w-5 h-0.5 bg-stone-600 dark:bg-brown-300 rounded-full" />
						<span className="block w-5 h-0.5 bg-stone-600 dark:bg-brown-300 rounded-full" />
					</button>
					<p className="text-lg font-medium text-stone-800 dark:text-brown-100 tracking-tight">DishCipes<span className="text-brand-green">.</span></p>
				</div>

				<div key={`${view}-${articleSubview}`} className="animate-viewFade">

				{view === 'articles' && articleSubview === 'list' && (
					<div className="px-4 py-6 md:px-12 md:py-8">
						<div className="flex items-center justify-between mb-6">
							<h1 className="text-xl font-bold text-stone-800 dark:text-brown-100">Article management</h1>
							<button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-stone-800 dark:bg-dark-elevated rounded-full hover:bg-stone-700 dark:hover:bg-dark-border transition-colors duration-150">
								<img src={addIcon} alt="" className="w-4 h-4 invert" />
								Create article
							</button>
						</div>
						<hr className="border-stone-200 dark:border-dark-border mb-6" />
						<div className="flex flex-col gap-2 mb-4 md:flex-row md:items-center md:gap-3">
							<div className="relative w-full md:flex-1 md:min-w-48 md:max-w-xs">
								<img src={searchIcon} alt="" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
								<input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-lg outline-none focus:border-stone-400 dark:focus:border-dark-border transition-colors duration-150 placeholder:text-stone-400 dark:placeholder:text-brown-400" />
							</div>
							<div className="flex items-center gap-2 md:gap-3">
							<div className="relative flex-1 md:flex-none">
								<select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} className="appearance-none w-full pl-4 pr-9 py-2 text-sm text-stone-600 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-lg outline-none focus:border-stone-400 cursor-pointer transition-colors duration-150">
									<option value="all">Status</option>
									<option value="published">Published</option>
									<option value="draft">Draft</option>
								</select>
								<img src={expandDownIcon} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
							</div>
							<div className="relative flex-1 md:flex-none">
								<select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="appearance-none w-full pl-4 pr-9 py-2 text-sm text-stone-600 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-lg outline-none focus:border-stone-400 cursor-pointer transition-colors duration-150">
									<option value="all">Category</option>
									{categories.map(c => <option key={c} value={c}>{c}</option>)}
								</select>
								<img src={expandDownIcon} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
							</div>
							</div>
						</div>
						<div className="rounded-xl overflow-hidden border border-brown-300 dark:border-dark-border">
							<table className="w-full text-base">
								<thead>
									<tr className="bg-brown-200 dark:bg-dark-surface border-b border-brown-300 dark:border-dark-border">
										<th className="text-left px-4 py-3 text-stone-500 dark:text-brown-300 font-medium md:px-5">Article title</th>
										<th className="hidden md:table-cell text-left px-5 py-3 text-stone-500 dark:text-brown-300 font-medium w-32">Category</th>
										<th className="hidden md:table-cell text-left px-5 py-3 text-stone-500 dark:text-brown-300 font-medium w-36">Status</th>
										<th className="w-12 md:w-20" />
									</tr>
								</thead>
								<tbody>
									{filteredArticles.map(a => (
										<tr key={a.id} className="odd:bg-brown-100 dark:odd:bg-dark-bg even:bg-brown-200 dark:even:bg-dark-surface transition-colors duration-100">
											<td className="px-4 py-3 md:px-5 md:py-3.5">
											<p className="md:hidden text-[10px] font-medium text-emerald-600 mb-0.5">
												{a.status === 'published' ? 'Published' : <span className="text-stone-400 dark:text-brown-400">Draft</span>}
											</p>
											<p className="text-stone-700 dark:text-brown-100 font-medium truncate max-w-50 md:max-w-xs text-base">{a.title}</p>
										</td>
											<td className="hidden md:table-cell px-5 py-3.5 text-base font-medium text-stone-600 dark:text-brown-200">{a.category}</td>
											<td className="hidden md:table-cell px-5 py-3.5">
												{a.status === 'published'
													? <span className="text-base text-emerald-600 font-medium">• Published</span>
													: <span className="text-base text-stone-400 dark:text-brown-400 font-medium">• Draft</span>
												}
											</td>
											<td className="px-4 py-3.5">
												{/* Desktop: icon buttons */}
												<div className="hidden md:flex items-center gap-3 justify-end">
													<button onClick={() => openEdit(a)} className="hover:opacity-60 transition-opacity duration-150">
														<img src={editIcon} alt="Edit" className="w-5 h-5" />
													</button>
													<button onClick={() => setDeleteTargetId(a.id)} className="hover:opacity-60 transition-opacity duration-150">
														<img src={trashIcon} alt="Delete" className="w-5 h-5" />
													</button>
												</div>
												{/* Mobile: 3-dot menu */}
												<div className="md:hidden relative flex justify-end" data-row-menu>
													<button
														onClick={() => setOpenMenuId(openMenuId === a.id ? null : a.id)}
														className="w-8 h-8 flex flex-col items-center justify-center gap-0.75 rounded-lg hover:bg-brown-300/60 dark:hover:bg-dark-elevated active:scale-90 transition-all duration-150"
													>
														<span className="block w-1 h-1 rounded-full bg-stone-500 dark:bg-brown-300" />
														<span className="block w-1 h-1 rounded-full bg-stone-500 dark:bg-brown-300" />
														<span className="block w-1 h-1 rounded-full bg-stone-500 dark:bg-brown-300" />
													</button>
													{openMenuId === a.id && (
														<div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-dark-surface border border-brown-200 dark:border-dark-border rounded-xl shadow-lg dark:shadow-black/40 overflow-hidden z-20 animate-slideDown">
															<button
																onClick={() => { openEdit(a); setOpenMenuId(null); }}
																className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-stone-700 dark:text-brown-100 hover:bg-brown-50 dark:hover:bg-dark-elevated transition-colors duration-150"
															>
																<img src={editIcon} alt="" className="w-4 h-4" />
																Edit
															</button>
															<button
																onClick={() => { setDeleteTargetId(a.id); setOpenMenuId(null); }}
																className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
															>
																<img src={trashIcon} alt="" className="w-4 h-4" />
																Delete
															</button>
														</div>
													)}
												</div>
											</td>
										</tr>
									))}
									{filteredArticles.length === 0 && (
										<tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-stone-400 dark:text-brown-400">No articles found</td></tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{view === 'articles' && (articleSubview === 'create' || articleSubview === 'edit') && (
					<div className="px-4 py-6 md:px-12 md:py-8">
						<div className="flex items-center justify-between mb-6">
							<h1 className="text-xl font-bold text-stone-800 dark:text-brown-100">{articleSubview === 'create' ? 'Create article' : 'Edit article'}</h1>
							<div className="flex items-center gap-3">
								<button onClick={handleSaveDraft} className="px-5 py-2.5 text-sm font-medium text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-300 dark:border-dark-border rounded-full hover:bg-stone-50 dark:hover:bg-dark-border transition-colors duration-150">Save as draft</button>
								<button onClick={handleSavePublish} className="px-5 py-2.5 text-sm font-medium text-white bg-stone-800 dark:bg-dark-elevated rounded-full hover:bg-stone-700 dark:hover:bg-dark-border transition-colors duration-150">{articleSubview === 'create' ? 'Save and publish' : 'Save'}</button>
							</div>
						</div>
						<hr className="border-stone-200 dark:border-dark-border mb-8" />
						<div className="max-w-2xl flex flex-col gap-6">
							<div>
								<p className="text-sm text-stone-500 dark:text-brown-300 mb-3">Thumbnail image</p>
								<div className="flex items-start gap-6">
									<div className="w-64 h-40 border-2 border-dashed border-stone-300 dark:border-dark-border rounded-xl overflow-hidden flex items-center justify-center bg-stone-100 dark:bg-dark-elevated cursor-pointer shrink-0" onClick={() => thumbnailRef.current?.click()}>
										{form.image ? (
											<img src={form.image} alt="" className="w-full h-full object-cover" />
										) : (
											<svg className="w-8 h-8 text-stone-300 dark:text-brown-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
										)}
									</div>
									<input ref={thumbnailRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
									<button type="button" onClick={() => thumbnailRef.current?.click()} className="px-5 py-2.5 text-sm font-medium text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-300 dark:border-dark-border rounded-full hover:bg-stone-50 dark:hover:bg-dark-border transition-colors duration-150">Upload thumbnail image</button>
								</div>
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500 dark:text-brown-300">Category</label>
								<div className="relative">
									<select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} className="appearance-none w-full px-4 py-3 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-xl outline-none focus:border-stone-400 cursor-pointer transition-colors duration-150">
										<option value="">Select category</option>
										{categories.map(c => <option key={c} value={c}>{c}</option>)}
									</select>
									<img src={expandDownIcon} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
								</div>
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-400 dark:text-brown-300">Author name</label>
								<input type="text" placeholder={user.name} value={form.authorName} onChange={e => setForm(prev => ({ ...prev, authorName: e.target.value }))} className={inputCls()} />
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500 dark:text-brown-300">Title</label>
								<input type="text" placeholder="Article title" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} className={inputCls()} />
							</div>
							<div className="flex flex-col gap-1.5">
								<div className="flex items-center justify-between">
									<label className="text-sm text-stone-500 dark:text-brown-300">Introduction (max 120 letters)</label>
									<span className={`text-xs ${form.description.length > 120 ? 'text-red-400' : 'text-stone-400 dark:text-brown-400'}`}>{form.description.length}/120</span>
								</div>
								<textarea placeholder="Introduction" value={form.description} maxLength={120} rows={3} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-3 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-xl outline-none focus:border-stone-400 placeholder:text-stone-300 dark:placeholder:text-brown-400 transition-colors duration-150 resize-none" />
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500 dark:text-brown-300">Content</label>
								<textarea placeholder="Content" value={form.content} rows={14} onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))} className="w-full px-4 py-3 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-xl outline-none focus:border-stone-400 placeholder:text-stone-300 dark:placeholder:text-brown-400 transition-colors duration-150" />
							</div>
							{articleSubview === 'edit' && editingArticle && (
								<div className="pt-4 border-t border-stone-200 dark:border-dark-border">
									<button onClick={() => setDeleteTargetId(editingArticle.id)} className="flex items-center gap-2 text-sm text-stone-500 dark:text-brown-300 hover:text-red-500 transition-colors duration-150">
										<img src={trashIcon} alt="" className="w-4 h-4" />
										Delete article
									</button>
								</div>
							)}
						</div>
					</div>
				)}

				{view === 'analytics' && (
					<div className="px-4 py-6 md:px-12 md:py-8">
						<h1 className="text-xl font-bold text-stone-800 dark:text-brown-100 mb-6">Dashboard</h1>
						<hr className="border-stone-200 dark:border-dark-border mb-6" />
						{!dashboard ? (
							<p className="text-sm text-stone-400 dark:text-brown-400">Loading...</p>
						) : (
							<div className="flex flex-col gap-6">
								{/* ── Stat cards ── */}
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

								{/* ── Charts row ── */}
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

								{/* ── Top articles ── */}
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
				)}

			{view === 'users' && (
					<div className="px-4 py-6 md:px-12 md:py-8">
						<h1 className="text-xl font-bold text-stone-800 dark:text-brown-100 mb-6">User management</h1>
						<hr className="border-stone-200 dark:border-dark-border mb-6" />
						<div className="bg-white dark:bg-dark-surface rounded-xl border border-stone-200 dark:border-dark-border overflow-hidden">
							{users.length === 0 && <p className="px-5 py-10 text-center text-sm text-stone-400 dark:text-brown-400">No users</p>}
							{users.map((u, i) => (
								<div key={u.id} className={`flex items-center gap-4 px-5 py-3.5 ${i < users.length - 1 ? 'border-b border-stone-100 dark:border-dark-border' : ''}`}>
									<div className="w-9 h-9 rounded-full bg-stone-200 dark:bg-dark-border overflow-hidden shrink-0">
										{u.avatarUrl ? <img src={u.avatarUrl} alt={u.displayName} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-300 dark:bg-dark-border" />}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-stone-700 dark:text-brown-100 truncate">{u.displayName}</p>
										<p className="text-xs text-stone-400 dark:text-brown-400 truncate">@{u.username} · {u.email}</p>
									</div>
									<div className="flex items-center gap-2 shrink-0">
										<span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${u.role === 'admin' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-stone-100 text-stone-500 dark:bg-dark-elevated dark:text-brown-300'}`}>{u.role}</span>
										{u.isBanned && <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400">banned</span>}
									</div>
									<div className="flex items-center gap-2 shrink-0">
										{u.role !== 'admin' && (
											<button onClick={() => setPromoteTargetId(u.id)} className="px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-brown-200 bg-stone-100 dark:bg-dark-elevated rounded-lg hover:bg-stone-200 dark:hover:bg-dark-border transition-colors duration-150">Promote</button>
										)}
										{u.role === 'admin' && u.id !== user?.id && (
											<button onClick={() => setDemoteTargetId(u.id)} className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 rounded-lg hover:bg-orange-100 transition-colors duration-150">Demote</button>
										)}
										{u.role !== 'admin' && (
											<button onClick={() => handleToggleBan(u.id, u.isBanned)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-150 ${u.isBanned ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100' : 'text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100'}`}>{u.isBanned ? 'Unban' : 'Ban'}</button>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

			{view === 'categories' && (
					<div className="px-4 py-6 md:px-12 md:py-8">
						<h1 className="text-xl font-bold text-stone-800 dark:text-brown-100 mb-6">Category management</h1>
						<hr className="border-stone-200 dark:border-dark-border mb-6" />
						<div className="max-w-sm">
							<div className="bg-white dark:bg-dark-surface rounded-xl border border-stone-200 dark:border-dark-border overflow-hidden mb-4">
								{categories.map((cat, i) => (
									<div key={cat} className={`flex items-center justify-between px-5 py-3.5 ${i < categories.length - 1 ? 'border-b border-stone-100 dark:border-dark-border' : ''}`}>
										<span className="text-sm text-stone-700 dark:text-brown-100">{cat}</span>
										<button onClick={async () => { await supabase.from('categories').delete().eq('name', cat); fetchCategories(); }} className="hover:opacity-60 transition-opacity duration-150">
											<img src={trashIcon} alt="Delete" className="w-5 h-5" />
										</button>
									</div>
								))}
								{categories.length === 0 && <p className="px-5 py-8 text-sm text-center text-stone-400 dark:text-brown-400">No categories</p>}
							</div>
							<div className="flex gap-2">
								<input type="text" placeholder="New category" value={newCategory} onChange={e => setNewCategory(e.target.value)} onKeyDown={async e => { if (e.key === 'Enter' && newCategory.trim() && !categories.includes(newCategory.trim())) { await supabase.from('categories').insert({ name: newCategory.trim() }); fetchCategories(); setNewCategory(''); } }} className="flex-1 px-4 py-2.5 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-xl outline-none focus:border-stone-400 placeholder:text-stone-300 dark:placeholder:text-brown-400 transition-colors duration-150" />
								<button onClick={async () => { if (newCategory.trim() && !categories.includes(newCategory.trim())) { await supabase.from('categories').insert({ name: newCategory.trim() }); fetchCategories(); setNewCategory(''); } }} className="px-5 py-2.5 text-sm font-medium text-white bg-stone-800 rounded-xl hover:bg-stone-700 transition-colors duration-150">Add</button>
							</div>
						</div>
					</div>
				)}

				{view === 'profile' && (
					<div className="px-4 py-6 md:px-12 md:py-8">
						<div className="flex items-center justify-between mb-6">
							<h1 className="text-xl font-bold text-stone-800 dark:text-brown-100">Profile</h1>
							<button type="submit" form="profile-form" className="px-6 py-2.5 text-sm font-medium text-white bg-stone-800 rounded-full hover:bg-stone-700 transition-colors duration-150">Save</button>
						</div>
						<hr className="border-stone-200 dark:border-dark-border mb-6" />
						<form id="profile-form" onSubmit={handleProfileSave} className="max-w-2xl flex flex-col gap-5">
							<div className="flex items-center gap-5 pb-5 border-b border-stone-200 dark:border-dark-border">
								<div className="w-20 h-20 rounded-full overflow-hidden bg-stone-200 dark:bg-dark-elevated shrink-0">
									{profileAvatar ? (
										<img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<svg className="w-8 h-8 text-stone-400 dark:text-brown-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
											</svg>
										</div>
									)}
								</div>
								<input ref={profileAvatarRef} type="file" accept="image/*" className="hidden" onChange={handleProfileAvatarChange} />
								<button type="button" onClick={() => profileAvatarRef.current?.click()} className="px-5 py-2.5 text-sm font-medium text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-300 dark:border-dark-border rounded-full hover:bg-stone-50 dark:hover:bg-dark-border transition-colors duration-150">Upload profile picture</button>
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500 dark:text-brown-300">Name</label>
								<input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className={inputCls()} />
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500 dark:text-brown-300">Username</label>
								<input type="text" value={profileUsername} onChange={e => setProfileUsername(e.target.value)} className={inputCls()} />
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500 dark:text-brown-300">Email</label>
								<input type="email" value={user.email} disabled className="w-full px-4 py-3 text-sm text-stone-400 dark:text-brown-400 bg-stone-50 dark:bg-dark-bg border border-stone-200 dark:border-dark-border rounded-xl outline-none cursor-not-allowed" />
							</div>
							<div className="flex flex-col gap-1.5">
								<div className="flex items-center justify-between">
									<label className="text-sm text-stone-500 dark:text-brown-300">Bio (max 120 letters)</label>
									<span className={`text-xs ${profileBio.length > 120 ? 'text-red-400' : 'text-stone-400 dark:text-brown-400'}`}>{profileBio.length}/120</span>
								</div>
								<textarea value={profileBio} maxLength={120} rows={4} onChange={e => setProfileBio(e.target.value)} placeholder="Tell us about yourself..." className="w-full px-4 py-3 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-xl outline-none focus:border-stone-400 placeholder:text-stone-300 dark:placeholder:text-brown-400 transition-colors duration-150 resize-none" />
							</div>
						</form>
					</div>
				)}

				{view === 'notifications' && (
					<div className="px-4 py-6 md:px-12 md:py-8">
						<div className="flex items-center justify-between mb-6">
							<h1 className="text-xl font-bold text-stone-800 dark:text-brown-100">Notification</h1>
							{notifications.some((n) => !n.isRead) && (
								<button onClick={markAllRead} className="text-sm text-stone-500 dark:text-brown-300 hover:text-stone-800 dark:hover:text-brown-100 transition-colors duration-150">Mark all as read</button>
							)}
						</div>
						<hr className="border-stone-200 dark:border-dark-border mb-6" />
						<div className="max-w-lg bg-white dark:bg-dark-surface rounded-xl border border-stone-200 dark:border-dark-border overflow-hidden">
							{notifications.length === 0 && <p className="px-5 py-10 text-center text-sm text-stone-400 dark:text-brown-400">No notifications</p>}
							{notifications.map((n, i) => (
								<div key={n.id} className={`flex items-start gap-3 px-5 py-4 ${!n.isRead ? 'bg-stone-50 dark:bg-dark-elevated' : ''} ${i < notifications.length - 1 ? 'border-b border-stone-100 dark:border-dark-border' : ''}`}>
									<div className="w-10 h-10 rounded-full overflow-hidden bg-stone-200 dark:bg-dark-border shrink-0 mt-0.5">
										{n.actorAvatar ? <img src={n.actorAvatar} alt={n.actorName} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-300 dark:bg-dark-border" />}
									</div>
									<div className="flex-1">
										<p className="text-sm text-stone-700 dark:text-brown-100"><span className="font-semibold">{n.actorName}</span>{' '}{getNotifText(n)}</p>
										<p className="text-xs text-stone-400 dark:text-brown-400 mt-1">{new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
									</div>
									<div className="flex items-center gap-2 shrink-0 mt-1">
										{!n.isRead && <span className="w-2 h-2 bg-red-400 rounded-full" />}
										<button onClick={() => deleteNotification(n.id)} className="hover:opacity-60 transition-opacity duration-150">
											<img src={trashIcon} alt="Delete" className="w-4 h-4" />
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{view === 'reset-password' && (
					<div className="px-4 py-6 md:px-12 md:py-8">
						<h1 className="text-xl font-bold text-stone-800 dark:text-brown-100 mb-6">Reset password</h1>
						<hr className="border-stone-200 dark:border-dark-border mb-6" />
						<form onSubmit={handleResetSubmit} className="max-w-md flex flex-col gap-5">
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500 dark:text-brown-300">Current password</label>
								<input type="password" placeholder="Current password" value={resetCurrent} onChange={e => setResetCurrent(e.target.value)} className={inputCls(!!resetErrors.current)} />
								{resetErrors.current && <p className="text-xs text-red-500">{resetErrors.current}</p>}
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500 dark:text-brown-300">New password</label>
								<input type="password" placeholder="New password" value={resetNew} onChange={e => setResetNew(e.target.value)} className={inputCls(!!resetErrors.new)} />
								{resetErrors.new && <p className="text-xs text-red-500">{resetErrors.new}</p>}
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500 dark:text-brown-300">Confirm new password</label>
								<input type="password" placeholder="Confirm new password" value={resetConfirm} onChange={e => setResetConfirm(e.target.value)} className={inputCls(!!resetErrors.confirm)} />
								{resetErrors.confirm && <p className="text-xs text-red-500">{resetErrors.confirm}</p>}
							</div>
							<div>
								<button type="submit" className="px-8 py-2.5 text-sm font-medium text-white bg-stone-800 rounded-full hover:bg-stone-700 transition-colors duration-150">Reset password</button>
							</div>
						</form>
					</div>
				)}
				</div>
			</main>

			{deleteTargetId !== null && (
				<ConfirmModal
					title="Delete article"
					message="Do you want to delete this article?"
					confirmLabel="Delete"
					cancelLabel="Cancel"
					onConfirm={handleDeleteConfirm}
					onCancel={() => setDeleteTargetId(null)}
				/>
			)}

			{promoteTargetId !== null && (
				<ConfirmModal
					title="Promote to admin"
					message="Are you sure you want to promote this user to admin?"
					confirmLabel="Promote"
					cancelLabel="Cancel"
					onConfirm={handlePromoteConfirm}
					onCancel={() => setPromoteTargetId(null)}
				/>
			)}

			{demoteTargetId !== null && (
				<ConfirmModal
					title="Demote to member"
					message="Are you sure you want to demote this admin to member?"
					confirmLabel="Demote"
					cancelLabel="Cancel"
					onConfirm={handleDemoteConfirm}
					onCancel={() => setDemoteTargetId(null)}
				/>
			)}

			{toast.show && (
				<Toast
					title={toast.title}
					message={toast.message}
					variant="success"
					onClose={() => setToast(prev => ({ ...prev, show: false }))}
				/>
			)}
		</div>
	);
};

export default AdminPage;
