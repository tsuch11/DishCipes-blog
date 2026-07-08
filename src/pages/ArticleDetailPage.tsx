// ── ArticleDetailPage ─────────────────────────────────────────────────
// Full article view with reading time, related articles, and comment section
// แก้ไขได้: reading time calculation, related articles count, back-to-top threshold (300px)

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useArticle } from '../hooks/useArticles';
import { useArticleLikes } from '../hooks/useArticleLikes';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CommentItem from '../components/shared/CommentItem';
import PageLoader from '../components/ui/PageLoader';
import AuthModal from '../components/ui/AuthModal';
import GoBackButton from '../components/ui/GoBackButton';
import happyLightIcon from '../assets/images/icons/happy_light.svg';
import copyLightIcon from '../assets/images/icons/Copy_light.svg';
import facebookIcon from '../assets/images/icons/Facebook_black.svg';
import linkedinIcon from '../assets/images/icons/LinkedIN_black.svg';
import twitterIcon from '../assets/images/icons/Twitter_black.svg';

const ArticleDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const articleId = Number(id);
	const { article, loading: articleLoading } = useArticle(articleId);
	const { user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	// ── Hooks ─────────────────────────────────────────────────────────
	const { liked, likeCount, toggle: toggleLike } = useArticleLikes(articleId, user?.id);
	const { comments, sendComment, likeComment, editComment, deleteComment, sendReply, likeReply, editReply, deleteReply } = useComments(articleId, user?.id);

	// ── UI State ──────────────────────────────────────────────────────
	const [showBackTop, setShowBackTop] = useState(false);
	const [commentText, setCommentText] = useState('');
	const [copied, setCopied] = useState(false);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [openReplyId, setOpenReplyId] = useState<number | null>(null);
	const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
	const [replyTargetUserId, setReplyTargetUserId] = useState<string | null>(null);

	useEffect(() => {
		const onScroll = () => setShowBackTop(window.scrollY > 300);
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	// ── Handlers ─────────────────────────────────────────────────────
	const showAuth = () => setShowAuthModal(true);

	const handleCopyLink = () => {
		navigator.clipboard.writeText(window.location.href);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleSendComment = () => {
		if (!commentText.trim()) return;
		sendComment(commentText.trim(), user?.name ?? 'Unknown', user?.username ?? '', user?.avatar ?? '', showAuth);
		setCommentText('');
	};

	const handleReply = (commentId: number) => {
		const text = replyTexts[commentId]?.trim();
		if (!text) return;
		sendReply(commentId, text, replyTargetUserId, showAuth);
		setReplyTexts((prev) => ({ ...prev, [commentId]: '' }));
		setReplyTargetUserId(null);
		setOpenReplyId(null);
	};

	const handleReplyToReply = (commentId: number, authorName: string, authorUserId: string) => {
		if (!user) { showAuth(); return; }
		setOpenReplyId(commentId);
		setReplyTexts((prev) => ({ ...prev, [commentId]: `@${authorName} ` }));
		setReplyTargetUserId(authorUserId);
	};

	// ── Render ────────────────────────────────────────────────────────
	if (articleLoading) return <PageLoader />;

	if (!article) {
		return (
			<div className="min-h-screen flex flex-col font-sans dark:bg-dark-bg">
				<Navbar />
				<main className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<p className="text-brown-400 dark:text-brown-300 text-sm mb-4">Article not found.</p>
						<Link to="/" className="text-sm font-medium text-brown-600 dark:text-brown-100 underline underline-offset-4 hover:text-brown-500 transition-colors duration-150">
							← Back to home
						</Link>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col font-sans dark:bg-dark-bg">
			<Navbar />

			<main className="flex-1 animate-pageFade">
				<div className="max-w-7xl mx-auto px-4 pt-6 md:px-10">
					<div className="mb-5">
						<GoBackButton label="Latest Recipes" />
					</div>

					<div className="relative w-full aspect-video bg-brown-200 dark:bg-dark-elevated rounded-2xl overflow-hidden mb-8">
						{article.image ? (
							<img src={article.image} alt={article.title} className="absolute inset-0 w-full h-full object-cover" />
						) : (
							<div className="absolute inset-0 bg-brown-300 dark:bg-dark-border" />
						)}
					</div>

					<div className="grid grid-cols-1 gap-10 pb-16 md:grid-cols-[1fr_260px]">
						<article>
							<div className="flex items-center justify-between gap-3 mb-3">
								<div className="flex items-center gap-3">
									<span className="px-2.5 py-0.5 text-xs font-medium text-brand-green bg-brand-green-light dark:bg-brand-green/15 rounded-full">
										{article.category}
									</span>
									<span className="text-xs text-brown-400 dark:text-brown-300">{article.date}</span>
								</div>
								{(user?.id === article.authorId || user?.role === 'admin') && (
									<button
										onClick={() => navigate(`/article/${articleId}/edit`)}
										className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brown-500 dark:text-brown-300 border border-brown-300 dark:border-dark-border rounded-full hover:bg-brown-100 dark:hover:bg-dark-elevated hover:text-brown-600 dark:hover:text-brown-100 transition-all duration-150"
									>
										<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
										</svg>
										Edit
									</button>
								)}
							</div>

							<h1 className="text-2xl font-bold text-brown-600 dark:text-brown-100 leading-tight mb-6 md:text-3xl">
								{article.title}
							</h1>

							<div className="flex flex-col gap-5 mb-12 max-w-3xl">
								{article.content?.map((paragraph, index) => {
									const isStep = /^Step \d+/.test(paragraph);
									if (isStep) {
										const colonIdx = paragraph.indexOf(':');
										const label = paragraph.substring(0, colonIdx + 1);
										const body = paragraph.substring(colonIdx + 1);
										return (
											<p key={index} className="text-base text-brown-500 dark:text-brown-200 leading-relaxed whitespace-pre-line md:text-lg">
												<span className="font-bold">{label}</span>
												<span className="font-normal">{body}</span>
											</p>
										);
									}
									return (
										<p key={index} className="text-base font-medium text-brown-500 dark:text-brown-200 leading-relaxed whitespace-pre-line md:text-lg">
											{paragraph}
										</p>
									);
								})}
							</div>

							{/* ── Mobile author card ── */}
							<div className="mb-8 bg-brown-200 dark:bg-dark-surface rounded-2xl p-5 md:hidden">
								<p className="text-xs text-brown-400 dark:text-brown-300 mb-4">Author</p>
								<Link to={`/user/${article.authorUsername}`} className="flex items-center gap-3 pb-4 mb-4 border-b border-brown-300 dark:border-dark-border group">
									<div className="w-10 h-10 rounded-full bg-brown-300 dark:bg-dark-elevated overflow-hidden shrink-0">
										{article.authorAvatar ? (
											<img src={article.authorAvatar} alt={article.authorName} className="w-full h-full object-cover" />
										) : null}
									</div>
									<p className="text-sm font-bold text-brown-500 dark:text-brown-200 group-hover:underline">{article.authorName}</p>
								</Link>
								<p className="text-base font-medium text-brown-400 dark:text-brown-300 leading-relaxed mb-3">
									I am a food enthusiast and freelance writer who specializes in recipe development and home cooking. With a deep love for Thai cuisine, I enjoy sharing recipes, cooking tips, and stories behind every dish.
								</p>
								<p className="text-base font-medium text-brown-400 dark:text-brown-300 leading-relaxed">
									When I'm not writing, I spend my time exploring local markets and street food stalls, discovering new flavors to bring back to my kitchen.
								</p>
							</div>

							{/* ── Reactions bar ── */}
							<div className="pt-6 mb-8 max-w-3xl">
								<div className="flex flex-col gap-3 w-full bg-brown-200 dark:bg-dark-surface rounded-lg px-3 py-3 md:flex-row md:items-center md:justify-between md:px-6 md:py-4">
									<button
										onClick={() => toggleLike(showAuth)}
										className={`flex items-center justify-center gap-1.5 w-full py-2 text-base font-medium rounded-full border transition-colors duration-150 md:w-auto md:px-10 md:py-2.5 ${liked ? 'bg-brown-600 text-white border-brown-600' : 'bg-white dark:bg-dark-elevated text-brown-500 dark:text-brown-200 border-brown-400 dark:border-dark-border hover:bg-brown-100 dark:hover:bg-dark-border'}`}
									>
										<img src={happyLightIcon} alt="" className={`w-6 h-6 md:w-8 md:h-8 ${liked ? 'invert' : ''}`} />
										{likeCount}
									</button>

									<div className="flex flex-wrap items-center gap-2 md:gap-3">
										<button
											onClick={handleCopyLink}
											className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-brown-600 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-brown-400 dark:border-dark-border rounded-full hover:bg-brown-100 dark:hover:bg-dark-border transition-colors duration-150 md:px-10 md:py-2.5 md:text-base"
										>
											<img src={copyLightIcon} alt="" className="w-5 h-5 md:w-8 md:h-8" />
											{copied ? 'Copied!' : 'Copy link'}
										</button>

										<div className="flex items-center gap-1 md:gap-2">
											<a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="opacity-90 dark:opacity-60 hover:opacity-70 dark:hover:opacity-90 transition-opacity duration-150">
												<img src={facebookIcon} alt="" className="w-9 h-9 md:w-12 md:h-12" />
											</a>
											<a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="opacity-90 dark:opacity-60 hover:opacity-70 dark:hover:opacity-90 transition-opacity duration-150">
												<img src={linkedinIcon} alt="" className="w-9 h-9 md:w-12 md:h-12" />
											</a>
											<a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="Share on X" className="opacity-90 dark:opacity-60 hover:opacity-70 dark:hover:opacity-90 transition-opacity duration-150">
												<img src={twitterIcon} alt="" className="w-9 h-9 md:w-12 md:h-12" />
											</a>
										</div>
									</div>
								</div>
							</div>

							{/* ── Comments ── */}
							<div className="max-w-3xl">
								<p className="text-base text-brown-400 dark:text-brown-300 mb-3">
									{(() => {
										const total = comments.length + comments.reduce((sum, c) => sum + c.replies.length, 0);
										return total > 0 ? `${total} Comment${total > 1 ? 's' : ''}` : 'Comments';
									})()}
								</p>
								<textarea
									value={commentText}
									onChange={(e) => setCommentText(e.target.value)}
									onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
									placeholder="What are your thoughts?"
									rows={3}
									className="w-full px-4 py-3 text-base text-brown-600 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-brown-200 dark:border-dark-border rounded-xl outline-none placeholder:text-brown-300 dark:placeholder:text-brown-400 focus:border-brown-400 dark:focus:border-dark-border transition-colors duration-150 mb-3"
								/>
								<div className="flex justify-start mb-8">
									<button
										onClick={handleSendComment}
										className="px-10 py-3 text-base font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 transition-colors duration-150"
									>
										Send
									</button>
								</div>

								<div className="flex flex-col divide-y divide-brown-300 dark:divide-dark-border">
									{comments.map((c) => (
										<CommentItem
											key={c.id}
											comment={c}
											openReplyId={openReplyId}
											replyText={replyTexts[c.id] ?? ''}
											currentUserId={user?.id ?? ''}
											isAdmin={user?.role === 'admin'}
											onLike={(commentId) => likeComment(commentId, showAuth)}
											onReplyToggle={(id) => { setOpenReplyId(openReplyId === id ? null : id); setReplyTargetUserId(null); }}
											onReplyTextChange={(id, text) => setReplyTexts((prev) => ({ ...prev, [id]: text }))}
											onReply={handleReply}
											onReplyLike={(replyId, commentId) => likeReply(replyId, commentId, showAuth)}
											onReplyToReply={handleReplyToReply}
											onEdit={editComment}
											onDelete={deleteComment}
											onEditReply={editReply}
											onDeleteReply={deleteReply}
										/>
									))}
								</div>
							</div>
						</article>

						{/* ── Desktop author card ── */}
						<aside className="hidden md:block">
							<div className="sticky top-32 bg-brown-200 dark:bg-dark-surface rounded-2xl p-5">
								<p className="text-xs text-brown-400 dark:text-brown-300 mb-4">Author</p>
								<Link to={`/user/${article.authorUsername}`} className="flex items-center gap-3 pb-4 mb-4 border-b border-brown-300 dark:border-dark-border group">
									<div className="w-10 h-10 rounded-full bg-brown-300 dark:bg-dark-elevated overflow-hidden shrink-0">
										{article.authorAvatar ? (
											<img src={article.authorAvatar} alt={article.authorName} className="w-full h-full object-cover" />
										) : null}
									</div>
									<p className="text-sm font-bold text-brown-500 dark:text-brown-200 group-hover:underline">{article.authorName}</p>
								</Link>
								<p className="text-xs text-brown-400 dark:text-brown-300 leading-relaxed mb-3">
									I am a food enthusiast and freelance writer who specializes in recipe development and home cooking. With a deep love for Thai cuisine, I enjoy sharing recipes, cooking tips, and stories behind every dish.
								</p>
								<p className="text-xs text-brown-400 dark:text-brown-300 leading-relaxed">
									When I'm not writing, I spend my time exploring local markets and street food stalls, discovering new flavors to bring back to my kitchen.
								</p>
							</div>
						</aside>
					</div>
				</div>
			</main>

			<Footer />

			{showBackTop && (
				<button
					onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
					className="fixed bottom-6 right-6 w-10 h-10 flex items-center justify-center bg-brown-500 text-white rounded-full shadow-md hover:bg-brown-600 transition-colors duration-150 z-40"
					aria-label="Back to top"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
					</svg>
				</button>
			)}

			{showAuthModal && (
				<AuthModal from={location.pathname} onClose={() => setShowAuthModal(false)} />
			)}
		</div>
	);
};

export default ArticleDetailPage;
