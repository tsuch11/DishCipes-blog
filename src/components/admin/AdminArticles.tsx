// ── AdminArticles ─────────────────────────────────────────────────────
// Article list + create/edit form for admin panel
// แก้ไขได้: article table columns, form fields, thumbnail upload path

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useArticles } from '../../hooks/useArticles';
import { supabase } from '../../lib/supabase';
import ConfirmModal from '../ui/ConfirmModal';
import addIcon from '../../assets/images/icons/Add_round_light.svg';
import searchIcon from '../../assets/images/icons/Search_light.svg';
import editIcon from '../../assets/images/icons/Edit_light.svg';
import trashIcon from '../../assets/images/icons/Trash_light.svg';
import expandDownIcon from '../../assets/images/icons/Expand_down_light.svg';

// ── Types ─────────────────────────────────────────────────────────────
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

type Props = {
	subview: 'list' | 'create' | 'edit';
	onSubviewChange: (v: 'list' | 'create' | 'edit') => void;
	showToast: (title: string, message: string) => void;
};

const inputCls = (err?: boolean) =>
	`w-full px-4 py-3 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border rounded-xl outline-none placeholder:text-stone-300 dark:placeholder:text-brown-400 transition-colors duration-150 ${err ? 'border-red-400' : 'border-stone-200 dark:border-dark-border focus:border-stone-400 dark:focus:border-dark-border'}`;

// ── Component ─────────────────────────────────────────────────────────
const AdminArticles = ({ subview, onSubviewChange, showToast }: Props) => {
	const { user } = useAuth();
	const { articles: fetchedArticles, refetch: refetchArticles } = useArticles();

	// ── State ─────────────────────────────────────────────────────────
	const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null);
	const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
	const [categoryFilter, setCategoryFilter] = useState('all');
	const [form, setForm] = useState<ArticleForm>({ image: '', category: '', authorName: '', title: '', description: '', content: '' });
	const [categories, setCategories] = useState<string[]>([]);
	const [openMenuId, setOpenMenuId] = useState<number | null>(null);
	const thumbnailRef = useRef<HTMLInputElement>(null);

	// ── Effects ───────────────────────────────────────────────────────
	useEffect(() => {
		supabase.from('categories').select('name').order('name').then(({ data }) => {
			if (data) setCategories(data.map((c) => c.name));
		});
	}, []);

	const adminArticles: AdminArticle[] = fetchedArticles.map((a) => ({
		...a,
		status: (a.status ?? 'published') as 'published' | 'draft',
		readTime: a.readTime ?? 5,
		content: a.content ?? [],
	}));

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (!(e.target as Element).closest('[data-row-menu]')) setOpenMenuId(null);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	// ── Handlers ─────────────────────────────────────────────────────
	const openCreate = () => {
		setForm({ image: '', category: categories[0] ?? '', authorName: user?.name ?? '', title: '', description: '', content: '' });
		setEditingArticle(null);
		onSubviewChange('create');
	};

	const openEdit = (article: AdminArticle) => {
		setEditingArticle(article);
		setForm({ image: article.image, category: article.category, authorName: article.authorName, title: article.title, description: article.description, content: article.content.join('\n\n') });
		onSubviewChange('edit');
	};

	const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const ext = file.name.split('.').pop() ?? 'jpg';
		const path = `thumbnails/${Date.now()}.${ext}`;
		const { error } = await supabase.storage.from('article-images').upload(path, file);
		if (error) { console.error('Upload error:', error); return; }
		const { data } = supabase.storage.from('article-images').getPublicUrl(path);
		setForm((prev) => ({ ...prev, image: data.publicUrl }));
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
		if (subview === 'edit' && editingArticle) {
			const { error } = await supabase.from('articles').update(payload).eq('id', editingArticle.id);
			if (error) { console.error(error); return; }
		} else {
			const { error } = await supabase.from('articles').insert({ ...payload, author_id: user?.id });
			if (error) { console.error(error); return; }
		}
		await refetchArticles();
		onSubviewChange('list');
		showToast('Saved as draft', 'You can publish the article later');
	};

	const handleSavePublish = async () => {
		const payload = buildPayload('published');
		if (subview === 'edit' && editingArticle) {
			const { error } = await supabase.from('articles').update(payload).eq('id', editingArticle.id);
			if (error) { console.error(error); return; }
			showToast('Article updated', 'Your article has been successfully updated');
		} else {
			const { error } = await supabase.from('articles').insert({ ...payload, author_id: user?.id });
			if (error) { console.error(error); return; }
			showToast('Article published', 'Your article has been successfully published');
		}
		await refetchArticles();
		onSubviewChange('list');
	};

	const handleDeleteConfirm = async () => {
		if (deleteTargetId === null) return;
		const { error } = await supabase.from('articles').delete().eq('id', deleteTargetId);
		if (error) { console.error(error); return; }
		await refetchArticles();
		setDeleteTargetId(null);
		if (subview === 'edit') onSubviewChange('list');
		showToast('Article deleted', 'The article has been removed');
	};

	const filteredArticles = adminArticles
		.filter((a) => (searchQuery ? a.title.toLowerCase().includes(searchQuery.toLowerCase()) : true))
		.filter((a) => (statusFilter !== 'all' ? a.status === statusFilter : true))
		.filter((a) => (categoryFilter !== 'all' ? a.category === categoryFilter : true));

	// ── Render: list ──────────────────────────────────────────────────
	if (subview === 'list') return (
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
					<input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-lg outline-none focus:border-stone-400 dark:focus:border-dark-border transition-colors duration-150 placeholder:text-stone-400 dark:placeholder:text-brown-400" />
				</div>
				<div className="flex items-center gap-2 md:gap-3">
					<div className="relative flex-1 md:flex-none">
						<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="appearance-none w-full pl-4 pr-9 py-2 text-sm text-stone-600 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-lg outline-none focus:border-stone-400 cursor-pointer transition-colors duration-150">
							<option value="all">Status</option>
							<option value="published">Published</option>
							<option value="draft">Draft</option>
						</select>
						<img src={expandDownIcon} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
					</div>
					<div className="relative flex-1 md:flex-none">
						<select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="appearance-none w-full pl-4 pr-9 py-2 text-sm text-stone-600 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-lg outline-none focus:border-stone-400 cursor-pointer transition-colors duration-150">
							<option value="all">Category</option>
							{categories.map((c) => <option key={c} value={c}>{c}</option>)}
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
						{filteredArticles.map((a) => (
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
									<div className="hidden md:flex items-center gap-3 justify-end">
										<button onClick={() => openEdit(a)} className="hover:opacity-60 transition-opacity duration-150">
											<img src={editIcon} alt="Edit" className="w-5 h-5" />
										</button>
										<button onClick={() => setDeleteTargetId(a.id)} className="hover:opacity-60 transition-opacity duration-150">
											<img src={trashIcon} alt="Delete" className="w-5 h-5" />
										</button>
									</div>
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
		</div>
	);

	// ── Render: create/edit ───────────────────────────────────────────
	return (
		<div className="px-4 py-6 md:px-12 md:py-8">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-xl font-bold text-stone-800 dark:text-brown-100">{subview === 'create' ? 'Create article' : 'Edit article'}</h1>
				<div className="flex items-center gap-3">
					<button onClick={handleSaveDraft} className="px-5 py-2.5 text-sm font-medium text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-300 dark:border-dark-border rounded-full hover:bg-stone-50 dark:hover:bg-dark-border transition-colors duration-150">Save as draft</button>
					<button onClick={handleSavePublish} className="px-5 py-2.5 text-sm font-medium text-white bg-stone-800 dark:bg-dark-elevated rounded-full hover:bg-stone-700 dark:hover:bg-dark-border transition-colors duration-150">{subview === 'create' ? 'Save and publish' : 'Save'}</button>
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
						<select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} className="appearance-none w-full px-4 py-3 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-xl outline-none focus:border-stone-400 cursor-pointer transition-colors duration-150">
							<option value="">Select category</option>
							{categories.map((c) => <option key={c} value={c}>{c}</option>)}
						</select>
						<img src={expandDownIcon} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
					</div>
				</div>
				<div className="flex flex-col gap-1.5">
					<label className="text-sm text-stone-400 dark:text-brown-300">Author name</label>
					<input type="text" placeholder={user?.name} value={form.authorName} onChange={(e) => setForm((prev) => ({ ...prev, authorName: e.target.value }))} className={inputCls()} />
				</div>
				<div className="flex flex-col gap-1.5">
					<label className="text-sm text-stone-500 dark:text-brown-300">Title</label>
					<input type="text" placeholder="Article title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className={inputCls()} />
				</div>
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between">
						<label className="text-sm text-stone-500 dark:text-brown-300">Introduction (max 120 letters)</label>
						<span className={`text-xs ${form.description.length > 120 ? 'text-red-400' : 'text-stone-400 dark:text-brown-400'}`}>{form.description.length}/120</span>
					</div>
					<textarea placeholder="Introduction" value={form.description} maxLength={120} rows={3} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-3 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-xl outline-none focus:border-stone-400 placeholder:text-stone-300 dark:placeholder:text-brown-400 transition-colors duration-150 resize-none" />
				</div>
				<div className="flex flex-col gap-1.5">
					<label className="text-sm text-stone-500 dark:text-brown-300">Content</label>
					<textarea placeholder="Content" value={form.content} rows={14} onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} className="w-full px-4 py-3 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-stone-200 dark:border-dark-border rounded-xl outline-none focus:border-stone-400 placeholder:text-stone-300 dark:placeholder:text-brown-400 transition-colors duration-150" />
				</div>
				{subview === 'edit' && editingArticle && (
					<div className="pt-4 border-t border-stone-200 dark:border-dark-border">
						<button onClick={() => setDeleteTargetId(editingArticle.id)} className="flex items-center gap-2 text-sm text-stone-500 dark:text-brown-300 hover:text-red-500 transition-colors duration-150">
							<img src={trashIcon} alt="" className="w-4 h-4" />
							Delete article
						</button>
					</div>
				)}
			</div>

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
		</div>
	);
};

export default AdminArticles;
