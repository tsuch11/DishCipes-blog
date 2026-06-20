import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { articles } from '../data/articles';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

type Comment = {
	id: number;
	name: string;
	date: string;
	avatar: string;
	text: string;
};

const INITIAL_COMMENTS: Comment[] = [
	{
		id: 1,
		name: 'Jacob Lash',
		date: '12 September 2024 at 18:30',
		avatar: '',
		text: "I loved this article! It really explains everything in a way that's easy to understand. The tips are super practical and I've already tried a few of them.",
	},
	{
		id: 2,
		name: 'Ahri',
		date: '12 September 2024 at 18:30',
		avatar: '',
		text: "Such a great read! I've always been curious about this topic and now I finally feel like I understand it. Thanks for breaking it down so clearly!",
	},
	{
		id: 3,
		name: 'Mimi mama',
		date: '12 September 2024 at 18:30',
		avatar: '',
		text: 'This article perfectly captures what makes this so fascinating. I had no idea about some of these details. Fascinating stuff!',
	},
];

const ArticleDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const article = articles.find((a) => a.id === Number(id));
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(321);
	const [commentText, setCommentText] = useState('');
	const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
	const [copied, setCopied] = useState(false);
	const [showAuthModal, setShowAuthModal] = useState(false);

	const handleLike = () => {
		if (!isAuthenticated) { setShowAuthModal(true); return; }
		setLiked((prev) => !prev);
		setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
	};

	const handleCopyLink = () => {
		navigator.clipboard.writeText(window.location.href);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleSendComment = () => {
		if (!isAuthenticated) { setShowAuthModal(true); return; }
		if (!commentText.trim()) return;
		const newComment: Comment = {
			id: Date.now(),
			name: 'You',
			date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' at ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
			avatar: '',
			text: commentText.trim(),
		};
		setComments((prev) => [...prev, newComment]);
		setCommentText('');
	};

	if (!article) {
		return (
			<div className="min-h-screen flex flex-col font-sans">
				<Navbar />
				<main className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<p className="text-brown-400 text-sm mb-4">Article not found.</p>
						<Link to="/" className="text-sm font-medium text-brown-600 underline underline-offset-4 hover:text-brown-500 transition-colors duration-150">
							← Back to home
						</Link>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col font-sans">
			<Navbar />

			<main className="flex-1">
				<div className="max-w-5xl mx-auto px-4 pt-6 md:px-6">
					<Link to="/" className="inline-flex items-center gap-1.5 text-sm text-brown-400 hover:text-brown-600 transition-colors duration-150 mb-5">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						Latest Recipes
					</Link>

					<div className="relative w-full aspect-video bg-brown-200 rounded-2xl overflow-hidden mb-8">
						{article.image ? (
							<img src={article.image} alt={article.title} className="absolute inset-0 w-full h-full object-cover" />
						) : (
							<div className="absolute inset-0 bg-brown-300" />
						)}
					</div>

					<div className="grid grid-cols-1 gap-10 pb-16 md:grid-cols-[1fr_260px]">
						<article>
							<div className="flex items-center gap-3 mb-3">
								<span className="px-2.5 py-0.5 text-xs font-medium text-brand-green bg-brand-green-light rounded-full">
									{article.category}
								</span>
								<span className="text-xs text-brown-400">{article.date}</span>
							</div>

							<h1 className="text-2xl font-bold text-brown-600 leading-tight mb-6 md:text-3xl">
								{article.title}
							</h1>

							<div className="flex flex-col gap-5 mb-12">
								{article.content?.map((paragraph, index) => (
									<p key={index} className="text-sm text-brown-500 leading-relaxed md:text-base">
										{paragraph}
									</p>
								))}
							</div>

							<div className="border-t border-brown-200 pt-6 mb-8">
								<div className="flex items-center gap-3 flex-wrap">
									<button
										onClick={handleLike}
										className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-full border transition-colors duration-150 ${liked ? 'bg-brown-600 text-white border-brown-600' : 'text-brown-500 border-brown-300 hover:bg-brown-100'}`}
									>
										<svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										{likeCount}
									</button>

									<button
										onClick={handleCopyLink}
										className="flex items-center gap-1.5 px-4 py-2 text-sm text-brown-500 border border-brown-300 rounded-full hover:bg-brown-100 transition-colors duration-150"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
										</svg>
										{copied ? 'Copied!' : 'Copy link'}
									</button>

									<div className="flex items-center gap-2 ml-auto">
										<a href="#" aria-label="Share on Facebook" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90 transition-opacity duration-150">
											<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
												<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
											</svg>
										</a>
										<a href="#" aria-label="Share on LinkedIn" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0A66C2] text-white hover:opacity-90 transition-opacity duration-150">
											<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
												<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
											</svg>
										</a>
										<a href="#" aria-label="Share on Twitter" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1DA1F2] text-white hover:opacity-90 transition-opacity duration-150">
											<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
												<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
											</svg>
										</a>
									</div>
								</div>
							</div>

							<div>
								<p className="text-xs text-brown-400 mb-3">Comment</p>
								<textarea
									value={commentText}
									onChange={(e) => setCommentText(e.target.value)}
									placeholder="What are your thoughts?"
									rows={3}
									className="w-full px-4 py-3 text-sm text-brown-600 bg-white border border-brown-200 rounded-xl outline-none resize-none placeholder:text-brown-300 focus:border-brown-400 transition-colors duration-150 mb-3"
								/>
								<div className="flex justify-end mb-8">
									<button
										onClick={handleSendComment}
										className="px-6 py-2 text-sm font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 transition-colors duration-150"
									>
										Send
									</button>
								</div>

								<div className="flex flex-col divide-y divide-brown-100">
									{comments.map((c) => (
										<div key={c.id} className="flex gap-3 py-5">
											<div className="w-9 h-9 rounded-full bg-brown-300 overflow-hidden shrink-0">
												{c.avatar ? (
													<img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
												) : null}
											</div>
											<div>
												<p className="text-sm font-semibold text-brown-600">{c.name}</p>
												<p className="text-xs text-brown-300 mb-2">{c.date}</p>
												<p className="text-sm text-brown-500 leading-relaxed">{c.text}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</article>

						<aside className="hidden md:block">
							<div className="sticky top-6 bg-brown-200 rounded-2xl p-5">
								<p className="text-xs text-brown-400 mb-4">Author</p>
								<div className="flex items-center gap-3 pb-4 mb-4 border-b border-brown-300">
									<div className="w-10 h-10 rounded-full bg-brown-300 overflow-hidden shrink-0">
										{article.authorAvatar ? (
											<img src={article.authorAvatar} alt={article.authorName} className="w-full h-full object-cover" />
										) : null}
									</div>
									<p className="text-sm font-bold text-brown-600">{article.authorName}</p>
								</div>
								<p className="text-xs text-brown-500 leading-relaxed mb-3">
									I am a food enthusiast and freelance writer who specializes in recipe development and home cooking. With a deep love for Thai cuisine, I enjoy sharing recipes, cooking tips, and stories behind every dish.
								</p>
								<p className="text-xs text-brown-500 leading-relaxed">
									When I'm not writing, I spend my time exploring local markets and street food stalls, discovering new flavors to bring back to my kitchen.
								</p>
							</div>
						</aside>
					</div>
				</div>
			</main>

			<Footer />

			{showAuthModal && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={() => setShowAuthModal(false)}>
					<div className="relative bg-white rounded-lg px-8 py-10 w-full max-w-sm text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
						<button
							onClick={() => setShowAuthModal(false)}
							className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-brown-400 hover:text-brown-600 transition-colors duration-150"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
						<h2 className="text-xl font-bold text-brown-600 mb-6">Create an account to<br />continue</h2>
						<button
							onClick={() => { setShowAuthModal(false); navigate('/signup'); }}
							className="px-8 py-2.5 text-sm font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 transition-colors duration-150"
						>
							Create account
						</button>
						<p className="text-sm text-brown-400 mt-4">
							Already have an account?{' '}
							<Link to="/login" onClick={() => setShowAuthModal(false)} className="font-medium text-brown-600 hover:underline">
								Log in
							</Link>
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default ArticleDetailPage;
