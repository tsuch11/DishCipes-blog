import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { articles as initialArticles } from '../data/articles';
import { MOCK_NOTIFICATIONS } from '../data/notifications';
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

const AdminPage = () => {
	const { user, isAuthenticated, logout, updateProfile, resetPassword } = useAuth();
	const navigate = useNavigate();

	const [view, setView] = useState<AdminView>('articles');
	const [articleSubview, setArticleSubview] = useState<'list' | 'create' | 'edit'>('list');
	const [adminArticles, setAdminArticles] = useState<AdminArticle[]>(() =>
		initialArticles.map(a => ({ ...a, status: 'published' as const, readTime: a.readTime ?? 5, content: a.content ?? [] }))
	);
	const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null);
	const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
	const [categoryFilter, setCategoryFilter] = useState('all');
	const [form, setForm] = useState<ArticleForm>({ image: '', category: '', authorName: '', title: '', description: '', content: '' });
	const [toast, setToast] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' });
	const thumbnailRef = useRef<HTMLInputElement>(null);

	const [categories, setCategories] = useState<string[]>(() => Array.from(new Set(initialArticles.map(a => a.category))));
	const [newCategory, setNewCategory] = useState('');

	const [profileName, setProfileName] = useState(user?.name ?? '');
	const [profileUsername, setProfileUsername] = useState(user?.username ?? '');
	const [profileAvatar, setProfileAvatar] = useState(user?.avatar ?? '');
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

	const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setForm(prev => ({ ...prev, image: URL.createObjectURL(file) }));
	};

	const buildArticle = (status: 'published' | 'draft'): AdminArticle => ({
		id: editingArticle?.id ?? Date.now(),
		image: form.image,
		category: form.category,
		authorName: form.authorName,
		authorAvatar: user.avatar ?? '',
		title: form.title,
		description: form.description,
		date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
		readTime: Math.max(1, Math.ceil(form.content.split(' ').length / 200)),
		content: form.content ? form.content.split('\n\n').filter(Boolean) : [],
		status,
	});

	const handleSaveDraft = () => {
		const article = buildArticle('draft');
		setAdminArticles(prev => articleSubview === 'edit' ? prev.map(a => a.id === article.id ? article : a) : [article, ...prev]);
		setArticleSubview('list');
		showToast('Create article and saved as draft', 'You can publish article later');
	};

	const handleSavePublish = () => {
		const article = buildArticle('published');
		setAdminArticles(prev => articleSubview === 'edit' ? prev.map(a => a.id === article.id ? article : a) : [article, ...prev]);
		setArticleSubview('list');
		showToast('Create article and published', 'Your article has been successfully published');
	};

	const handleDeleteConfirm = () => {
		if (deleteTargetId === null) return;
		setAdminArticles(prev => prev.filter(a => a.id !== deleteTargetId));
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

	const handleProfileAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setProfileAvatar(URL.createObjectURL(file));
	};

	const handleProfileSave = async (e: React.FormEvent) => {
		e.preventDefault();
		await updateProfile({ name: profileName, username: profileUsername, avatar: profileAvatar });
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

	const adminNotifications = MOCK_NOTIFICATIONS.filter(n => n.forRoles.includes('admin'));
	const inputCls = (err?: boolean) =>
		`w-full px-4 py-3 text-sm text-stone-700 bg-white border rounded-xl outline-none placeholder:text-stone-300 transition-colors duration-150 ${err ? 'border-red-400' : 'border-stone-200 focus:border-stone-400'}`;

	return (
		<div className="min-h-screen bg-stone-50 font-sans flex">
			<AdminSidebar activeView={view} onNavigate={handleNavigate} onLogout={handleLogout} />

			<main className="ml-56 flex-1 min-h-screen">

				{view === 'articles' && articleSubview === 'list' && (
					<div className="px-8 py-8">
						<div className="flex items-center justify-between mb-6">
							<h1 className="text-xl font-bold text-stone-800">Article management</h1>
							<button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-stone-800 rounded-full hover:bg-stone-700 transition-colors duration-150">
								<img src={addIcon} alt="" className="w-4 h-4 invert" />
								Create article
							</button>
						</div>
						<hr className="border-stone-200 mb-6" />
						<div className="flex items-center gap-3 mb-4 flex-wrap">
							<div className="relative flex-1 min-w-48 max-w-xs">
								<img src={searchIcon} alt="" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
								<input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm text-stone-700 bg-white border border-stone-200 rounded-lg outline-none focus:border-stone-400 transition-colors duration-150" />
							</div>
							<div className="relative">
								<select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} className="appearance-none pl-4 pr-9 py-2 text-sm text-stone-600 bg-white border border-stone-200 rounded-lg outline-none focus:border-stone-400 cursor-pointer transition-colors duration-150">
									<option value="all">Status</option>
									<option value="published">Published</option>
									<option value="draft">Draft</option>
								</select>
								<img src={expandDownIcon} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
							</div>
							<div className="relative">
								<select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="appearance-none pl-4 pr-9 py-2 text-sm text-stone-600 bg-white border border-stone-200 rounded-lg outline-none focus:border-stone-400 cursor-pointer transition-colors duration-150">
									<option value="all">Category</option>
									{categories.map(c => <option key={c} value={c}>{c}</option>)}
								</select>
								<img src={expandDownIcon} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
							</div>
						</div>
						<div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-stone-200">
										<th className="text-left px-5 py-3 text-stone-500 font-medium">Article title</th>
										<th className="text-left px-5 py-3 text-stone-500 font-medium w-32">Category</th>
										<th className="text-left px-5 py-3 text-stone-500 font-medium w-36">Status</th>
										<th className="w-20" />
									</tr>
								</thead>
								<tbody>
									{filteredArticles.map(a => (
										<tr key={a.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors duration-100">
											<td className="px-5 py-3.5 text-stone-700 font-medium max-w-xs truncate">{a.title}</td>
											<td className="px-5 py-3.5 text-stone-500">{a.category}</td>
											<td className="px-5 py-3.5">
												{a.status === 'published'
													? <span className="text-emerald-600 font-medium">• Published</span>
													: <span className="text-stone-400 font-medium">• Draft</span>
												}
											</td>
											<td className="px-4 py-3.5">
												<div className="flex items-center gap-3 justify-end">
													<button onClick={() => openEdit(a)} className="hover:opacity-60 transition-opacity duration-150">
														<img src={editIcon} alt="Edit" className="w-5 h-5" />
													</button>
													<button onClick={() => setDeleteTargetId(a.id)} className="hover:opacity-60 transition-opacity duration-150">
														<img src={trashIcon} alt="Delete" className="w-5 h-5" />
													</button>
												</div>
											</td>
										</tr>
									))}
									{filteredArticles.length === 0 && (
										<tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-stone-400">No articles found</td></tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{view === 'articles' && (articleSubview === 'create' || articleSubview === 'edit') && (
					<div className="px-8 py-8">
						<div className="flex items-center justify-between mb-6">
							<h1 className="text-xl font-bold text-stone-800">{articleSubview === 'create' ? 'Create article' : 'Edit article'}</h1>
							<div className="flex items-center gap-3">
								<button onClick={handleSaveDraft} className="px-5 py-2.5 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-full hover:bg-stone-50 transition-colors duration-150">Save as draft</button>
								<button onClick={handleSavePublish} className="px-5 py-2.5 text-sm font-medium text-white bg-stone-800 rounded-full hover:bg-stone-700 transition-colors duration-150">{articleSubview === 'create' ? 'Save and publish' : 'Save'}</button>
							</div>
						</div>
						<hr className="border-stone-200 mb-8" />
						<div className="max-w-2xl flex flex-col gap-6">
							<div>
								<p className="text-sm text-stone-500 mb-3">Thumbnail image</p>
								<div className="flex items-start gap-6">
									<div className="w-64 h-40 border-2 border-dashed border-stone-300 rounded-xl overflow-hidden flex items-center justify-center bg-stone-100 cursor-pointer shrink-0" onClick={() => thumbnailRef.current?.click()}>
										{form.image ? (
											<img src={form.image} alt="" className="w-full h-full object-cover" />
										) : (
											<svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
										)}
									</div>
									<input ref={thumbnailRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
									<button type="button" onClick={() => thumbnailRef.current?.click()} className="px-5 py-2.5 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-full hover:bg-stone-50 transition-colors duration-150">Upload thumbnail image</button>
								</div>
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500">Category</label>
								<div className="relative">
									<select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} className="appearance-none w-full px-4 py-3 text-sm text-stone-700 bg-white border border-stone-200 rounded-xl outline-none focus:border-stone-400 cursor-pointer transition-colors duration-150">
										<option value="">Select category</option>
										{categories.map(c => <option key={c} value={c}>{c}</option>)}
									</select>
									<img src={expandDownIcon} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
								</div>
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-400">Author name</label>
								<input type="text" placeholder={user.name} value={form.authorName} onChange={e => setForm(prev => ({ ...prev, authorName: e.target.value }))} className={inputCls()} />
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500">Title</label>
								<input type="text" placeholder="Article title" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} className={inputCls()} />
							</div>
							<div className="flex flex-col gap-1.5">
								<div className="flex items-center justify-between">
									<label className="text-sm text-stone-500">Introduction (max 120 letters)</label>
									<span className={`text-xs ${form.description.length > 120 ? 'text-red-400' : 'text-stone-400'}`}>{form.description.length}/120</span>
								</div>
								<textarea placeholder="Introduction" value={form.description} maxLength={120} rows={3} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-3 text-sm text-stone-700 bg-white border border-stone-200 rounded-xl outline-none focus:border-stone-400 placeholder:text-stone-300 transition-colors duration-150 resize-none" />
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500">Content</label>
								<textarea placeholder="Content" value={form.content} rows={14} onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))} className="w-full px-4 py-3 text-sm text-stone-700 bg-white border border-stone-200 rounded-xl outline-none focus:border-stone-400 placeholder:text-stone-300 transition-colors duration-150" />
							</div>
							{articleSubview === 'edit' && editingArticle && (
								<div className="pt-4 border-t border-stone-200">
									<button onClick={() => setDeleteTargetId(editingArticle.id)} className="flex items-center gap-2 text-sm text-stone-500 hover:text-red-500 transition-colors duration-150">
										<img src={trashIcon} alt="" className="w-4 h-4" />
										Delete article
									</button>
								</div>
							)}
						</div>
					</div>
				)}

				{view === 'categories' && (
					<div className="px-8 py-8">
						<h1 className="text-xl font-bold text-stone-800 mb-6">Category management</h1>
						<hr className="border-stone-200 mb-6" />
						<div className="max-w-sm">
							<div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-4">
								{categories.map((cat, i) => (
									<div key={cat} className={`flex items-center justify-between px-5 py-3.5 ${i < categories.length - 1 ? 'border-b border-stone-100' : ''}`}>
										<span className="text-sm text-stone-700">{cat}</span>
										<button onClick={() => setCategories(prev => prev.filter(c => c !== cat))} className="hover:opacity-60 transition-opacity duration-150">
											<img src={trashIcon} alt="Delete" className="w-5 h-5" />
										</button>
									</div>
								))}
								{categories.length === 0 && <p className="px-5 py-8 text-sm text-center text-stone-400">No categories</p>}
							</div>
							<div className="flex gap-2">
								<input type="text" placeholder="New category" value={newCategory} onChange={e => setNewCategory(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newCategory.trim() && !categories.includes(newCategory.trim())) { setCategories(prev => [...prev, newCategory.trim()]); setNewCategory(''); } }} className="flex-1 px-4 py-2.5 text-sm text-stone-700 bg-white border border-stone-200 rounded-xl outline-none focus:border-stone-400 placeholder:text-stone-300 transition-colors duration-150" />
								<button onClick={() => { if (newCategory.trim() && !categories.includes(newCategory.trim())) { setCategories(prev => [...prev, newCategory.trim()]); setNewCategory(''); } }} className="px-5 py-2.5 text-sm font-medium text-white bg-stone-800 rounded-xl hover:bg-stone-700 transition-colors duration-150">Add</button>
							</div>
						</div>
					</div>
				)}

				{view === 'profile' && (
					<div className="px-8 py-8">
						<h1 className="text-xl font-bold text-stone-800 mb-6">Profile</h1>
						<hr className="border-stone-200 mb-6" />
						<form onSubmit={handleProfileSave} className="max-w-md flex flex-col gap-5">
							<div className="flex items-center gap-5 pb-5 border-b border-stone-200">
								<div className="w-20 h-20 rounded-full overflow-hidden bg-stone-200 shrink-0">
									{profileAvatar ? (
										<img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
											</svg>
										</div>
									)}
								</div>
								<input ref={profileAvatarRef} type="file" accept="image/*" className="hidden" onChange={handleProfileAvatarChange} />
								<button type="button" onClick={() => profileAvatarRef.current?.click()} className="px-5 py-2.5 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-full hover:bg-stone-50 transition-colors duration-150">Upload profile picture</button>
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500">Name</label>
								<input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className={inputCls()} />
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500">Username</label>
								<input type="text" value={profileUsername} onChange={e => setProfileUsername(e.target.value)} className={inputCls()} />
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500">Email</label>
								<p className="px-4 py-3 text-sm text-stone-400">{user.email}</p>
							</div>
							<div>
								<button type="submit" className="px-8 py-2.5 text-sm font-medium text-white bg-stone-800 rounded-full hover:bg-stone-700 transition-colors duration-150">Save</button>
							</div>
						</form>
					</div>
				)}

				{view === 'notifications' && (
					<div className="px-8 py-8">
						<h1 className="text-xl font-bold text-stone-800 mb-6">Notification</h1>
						<hr className="border-stone-200 mb-6" />
						<div className="max-w-lg bg-white rounded-xl border border-stone-200 overflow-hidden">
							{adminNotifications.length === 0 && <p className="px-5 py-10 text-center text-sm text-stone-400">No notifications</p>}
							{adminNotifications.map((n, i) => (
								<div key={n.id} className={`flex items-start gap-3 px-5 py-4 ${!n.read ? 'bg-stone-50' : ''} ${i < adminNotifications.length - 1 ? 'border-b border-stone-100' : ''}`}>
									<div className="w-10 h-10 rounded-full overflow-hidden bg-stone-200 shrink-0 mt-0.5">
										<img src={n.actorAvatar} alt={n.actorName} className="w-full h-full object-cover" />
									</div>
									<div className="flex-1">
										<p className="text-sm text-stone-700"><span className="font-semibold">{n.actorName}</span>{' '}{n.action}</p>
										<p className="text-xs text-stone-400 mt-1">{n.time}</p>
									</div>
									{!n.read && <span className="w-2 h-2 bg-red-400 rounded-full shrink-0 mt-2" />}
								</div>
							))}
						</div>
					</div>
				)}

				{view === 'reset-password' && (
					<div className="px-8 py-8">
						<h1 className="text-xl font-bold text-stone-800 mb-6">Reset password</h1>
						<hr className="border-stone-200 mb-6" />
						<form onSubmit={handleResetSubmit} className="max-w-md flex flex-col gap-5">
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500">Current password</label>
								<input type="password" placeholder="Current password" value={resetCurrent} onChange={e => setResetCurrent(e.target.value)} className={inputCls(!!resetErrors.current)} />
								{resetErrors.current && <p className="text-xs text-red-500">{resetErrors.current}</p>}
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500">New password</label>
								<input type="password" placeholder="New password" value={resetNew} onChange={e => setResetNew(e.target.value)} className={inputCls(!!resetErrors.new)} />
								{resetErrors.new && <p className="text-xs text-red-500">{resetErrors.new}</p>}
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm text-stone-500">Confirm new password</label>
								<input type="password" placeholder="Confirm new password" value={resetConfirm} onChange={e => setResetConfirm(e.target.value)} className={inputCls(!!resetErrors.confirm)} />
								{resetErrors.confirm && <p className="text-xs text-red-500">{resetErrors.confirm}</p>}
							</div>
							<div>
								<button type="submit" className="px-8 py-2.5 text-sm font-medium text-white bg-stone-800 rounded-full hover:bg-stone-700 transition-colors duration-150">Reset password</button>
							</div>
						</form>
					</div>
				)}
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
