// ── ArticleFormPage ───────────────────────────────────────────────────
// Create or edit an article (route: /article/new, /article/:id/edit)
// แก้ไขได้: MAX_IMAGE_MB, article-images bucket name, read_time formula

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import inputCls from '../utils/inputCls';

const MAX_IMAGE_MB = 5;

// ── Component ─────────────────────────────────────────────────────────
const ArticleFormPage = () => {
	const { id } = useParams<{ id?: string }>();
	const isEdit = !!id;
	const articleId = Number(id);
	const { user } = useAuth();
	const navigate = useNavigate();

	// ── State ─────────────────────────────────────────────────────────
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [category, setCategory] = useState('');
	const [content, setContent] = useState<string[]>(['']);
	const [image, setImage] = useState('');
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState('');
	const [status, setStatus] = useState<'published' | 'draft'>('published');
	const [categories, setCategories] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [fetchLoading, setFetchLoading] = useState(isEdit);
	const [error, setError] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	// ── Fetch categories ──────────────────────────────────────────────
	useEffect(() => {
		supabase.from('categories').select('name').order('name').then(({ data }) => {
			if (data) setCategories(data.map((c: { name: string }) => c.name));
		});
	}, []);

	// ── Fetch article data (edit mode) ────────────────────────────────
	useEffect(() => {
		if (!isEdit) return;
		supabase.from('articles').select('*').eq('id', articleId).single().then(({ data }) => {
			if (!data) { navigate('/'); return; }
			if (data.author_id !== user?.id && user?.role !== 'admin') { navigate('/'); return; }
			setTitle(data.title ?? '');
			setDescription(data.description ?? '');
			setCategory(data.category ?? '');
			setContent(data.content?.length ? data.content : ['']);
			setImage(data.image ?? '');
			setImagePreview(data.image ?? '');
			setStatus(data.status ?? 'published');
			setFetchLoading(false);
		});
	}, [isEdit, articleId, user?.id, user?.role, navigate]);

	// ── Handlers ─────────────────────────────────────────────────────
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
			setError(`Image must be under ${MAX_IMAGE_MB}MB`);
			return;
		}
		setImageFile(file);
		setImagePreview(URL.createObjectURL(file));
		setError('');
	};

	const handleContentChange = (i: number, val: string) => {
		setContent((prev) => prev.map((p, idx) => idx === i ? val : p));
	};

	const handleAddParagraph = (i: number) => {
		setContent((prev) => [...prev.slice(0, i + 1), '', ...prev.slice(i + 1)]);
	};

	const handleRemoveParagraph = (i: number) => {
		if (content.length <= 1) return;
		setContent((prev) => prev.filter((_, idx) => idx !== i));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;
		if (!title.trim()) { setError('Title is required.'); return; }
		if (!category) { setError('Please select a category.'); return; }

		setLoading(true);
		setError('');

		let coverUrl = image;

		if (imageFile) {
			const ext = imageFile.name.split('.').pop();
			const path = `${user.id}/${Date.now()}.${ext}`;
			const { data: uploadData, error: uploadError } = await supabase.storage
				.from('article-images')
				.upload(path, imageFile, { upsert: true });
			if (uploadError) { setError('Image upload failed.'); setLoading(false); return; }
			const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(uploadData.path);
			coverUrl = publicUrl;
		}

		const filledContent = content.filter((p) => p.trim());
		const readTime = Math.max(1, Math.ceil(filledContent.join(' ').split(/\s+/).length / 200));

		if (isEdit) {
			const { error: updateError } = await supabase
				.from('articles')
				.update({ title: title.trim(), description: description.trim(), category, content: filledContent, image: coverUrl, status, read_time: readTime })
				.eq('id', articleId);
			setLoading(false);
			if (updateError) { setError('Failed to update article.'); return; }
			navigate(`/article/${articleId}`);
		} else {
			const { data: newArticle, error: insertError } = await supabase
				.from('articles')
				.insert({ title: title.trim(), description: description.trim(), category, content: filledContent, image: coverUrl, status, author_id: user.id, read_time: readTime })
				.select('id')
				.single();
			setLoading(false);
			if (insertError) { setError('Failed to create article.'); return; }
			navigate(`/article/${newArticle.id}`);
		}
	};

	// ── Guard ─────────────────────────────────────────────────────────
	if (!user) {
		navigate('/login', { state: { from: isEdit ? `/article/${id}/edit` : '/article/new' } });
		return null;
	}

	if (fetchLoading) {
		return (
			<div className="min-h-screen flex flex-col font-sans dark:bg-dark-bg">
				<Navbar />
				<main className="flex-1 flex items-center justify-center">
					<p className="text-brown-400 dark:text-brown-300 text-sm">Loading...</p>
				</main>
			</div>
		);
	}

	// ── Render ────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen flex flex-col font-sans dark:bg-dark-bg">
			<Navbar />
			<main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10 md:px-0">
				<h1 className="text-3xl font-bold text-brown-600 dark:text-brown-100 mb-8">
					{isEdit ? 'Edit article' : 'New article'}
				</h1>

				<form onSubmit={handleSubmit} className="flex flex-col gap-6">
					{/* ── Cover image ── */}
					<div>
						<p className="text-sm font-medium text-brown-500 dark:text-brown-300 mb-2">Cover image</p>
						<div
							onClick={() => fileInputRef.current?.click()}
							className="relative w-full aspect-video rounded-2xl overflow-hidden bg-brown-200 dark:bg-dark-elevated border-2 border-dashed border-brown-300 dark:border-dark-border cursor-pointer hover:border-brown-400 dark:hover:border-brown-400 transition-colors duration-150"
						>
							{imagePreview ? (
								<img src={imagePreview} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
							) : (
								<div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
									<svg className="w-8 h-8 text-brown-300 dark:text-brown-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
									<p className="text-sm text-brown-400 dark:text-brown-300">Click to upload cover image</p>
									<p className="text-xs text-brown-300 dark:text-brown-400">Max {MAX_IMAGE_MB}MB</p>
								</div>
							)}
						</div>
						<input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
						{imagePreview && (
							<button
								type="button"
								onClick={() => { setImageFile(null); setImagePreview(''); setImage(''); }}
								className="mt-2 text-xs text-brown-400 dark:text-brown-300 hover:text-red-500 transition-colors duration-150"
							>
								Remove image
							</button>
						)}
					</div>

					{/* ── Title ── */}
					<div>
						<label className="block text-sm font-medium text-brown-500 dark:text-brown-300 mb-2">Title</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Article title"
							className={inputCls(!title.trim() && !!error)}
						/>
					</div>

					{/* ── Description ── */}
					<div>
						<label className="block text-sm font-medium text-brown-500 dark:text-brown-300 mb-2">Description</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Short description or excerpt"
							rows={3}
							className={`${inputCls(false)} resize-none`}
						/>
					</div>

					{/* ── Category ── */}
					<div>
						<label className="block text-sm font-medium text-brown-500 dark:text-brown-300 mb-2">Category</label>
						<select
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							className={inputCls(!category && !!error)}
						>
							<option value="">Select a category</option>
							{categories.map((cat) => (
								<option key={cat} value={cat}>{cat}</option>
							))}
						</select>
					</div>

					{/* ── Content ── */}
					<div>
						<label className="block text-sm font-medium text-brown-500 dark:text-brown-300 mb-2">Content</label>
						<div className="flex flex-col gap-3">
							{content.map((paragraph, i) => (
								<div key={i} className="flex gap-2 items-start">
									<textarea
										value={paragraph}
										onChange={(e) => handleContentChange(i, e.target.value)}
										placeholder={`Paragraph ${i + 1}`}
										rows={4}
										className={`${inputCls(false)} resize-none flex-1`}
									/>
									<div className="flex flex-col gap-1 shrink-0 pt-1">
										<button
											type="button"
											onClick={() => handleAddParagraph(i)}
											title="Add paragraph below"
											className="w-7 h-7 flex items-center justify-center rounded-lg text-lg leading-none bg-brown-200 dark:bg-dark-elevated text-brown-500 dark:text-brown-300 hover:bg-brown-300 dark:hover:bg-dark-border transition-colors duration-150"
										>+</button>
										{content.length > 1 && (
											<button
												type="button"
												onClick={() => handleRemoveParagraph(i)}
												title="Remove paragraph"
												className="w-7 h-7 flex items-center justify-center rounded-lg text-lg leading-none bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150"
											>−</button>
										)}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* ── Status ── */}
					<div>
						<label className="block text-sm font-medium text-brown-500 dark:text-brown-300 mb-2">Status</label>
						<div className="flex gap-3">
							{(['published', 'draft'] as const).map((s) => (
								<button
									key={s}
									type="button"
									onClick={() => setStatus(s)}
									className={`px-5 py-2 text-sm font-medium rounded-full border capitalize transition-all duration-150 ${
										status === s
											? 'bg-brown-600 text-white border-brown-600'
											: 'bg-transparent text-brown-500 dark:text-brown-300 border-brown-300 dark:border-dark-border hover:border-brown-400'
									}`}
								>{s}</button>
							))}
						</div>
					</div>

					{error && <p className="text-sm text-red-500">{error}</p>}

					{/* ── Actions ── */}
					<div className="flex gap-3 justify-end pt-2 pb-4">
						<button
							type="button"
							onClick={() => navigate(-1)}
							className="px-6 py-2.5 text-sm font-medium text-brown-500 dark:text-brown-300 border border-brown-300 dark:border-dark-border rounded-full hover:bg-brown-100 dark:hover:bg-dark-elevated transition-all duration-150"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="px-8 py-2.5 text-sm font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
						>
							{loading ? 'Saving...' : isEdit ? 'Save changes' : 'Publish'}
						</button>
					</div>
				</form>
			</main>
			<Footer />
		</div>
	);
};

export default ArticleFormPage;
