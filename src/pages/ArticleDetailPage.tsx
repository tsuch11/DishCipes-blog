import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { articles } from '../data/articles';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import happyLightIcon from '../assets/images/icons/happy_light.svg';
import copyLightIcon from '../assets/images/icons/Copy_light.svg';
import jacobAvatar from '../assets/images/icons/Jacob_lash.svg';
import ahriAvatar from '../assets/images/icons/Ahri.svg';
import mimiAvatar from '../assets/images/icons/Mimi_mama.svg';
import facebookIcon from '../assets/images/icons/Facebook_black.svg';
import linkedinIcon from '../assets/images/icons/LinkedIN_black.svg';
import twitterIcon from '../assets/images/icons/Twitter_black.svg';

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
		avatar: jacobAvatar,
		text: "I loved this article! It really explains everything in a way that's easy to understand. The tips are super practical and I've already tried a few of them.",
	},
	{
		id: 2,
		name: 'Ahri',
		date: '12 September 2024 at 18:30',
		avatar: ahriAvatar,
		text: "Such a great read! I've always been curious about this topic and now I finally feel like I understand it. Thanks for breaking it down so clearly!",
	},
	{
		id: 3,
		name: 'Mimi mama',
		date: '12 September 2024 at 18:30',
		avatar: mimiAvatar,
		text: 'This article perfectly captures what makes this so fascinating. I had no idea about some of these details. Fascinating stuff!',
	},
];

const ArticleDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const article = articles.find((a) => a.id === Number(id));
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const [showBackTop, setShowBackTop] = useState(false);

	useEffect(() => {
		const onScroll = () => setShowBackTop(window.scrollY > 300);
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

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
							â† Back to home
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

			<main className="flex-1 animate-pageFade">
				<div className="max-w-7xl mx-auto px-4 pt-6 md:px-10">
					<button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-brown-400 hover:text-brown-600 transition-colors duration-150 mb-5">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						Latest Recipes
					</button>

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

							<div className="flex flex-col gap-5 mb-12 max-w-3xl">
								{article.content?.map((paragraph, index) => {
									const isStep = /^Step \d+/.test(paragraph);
									if (isStep) {
										const colonIdx = paragraph.indexOf(':');
										const label = paragraph.substring(0, colonIdx + 1);
										const body = paragraph.substring(colonIdx + 1);
										return (
											<p key={index} className="text-base text-brown-500 leading-relaxed whitespace-pre-line md:text-lg">
												<span className="font-bold">{label}</span>
												<span className="font-normal">{body}</span>
											</p>
										);
									}
									return (
										<p key={index} className="text-base font-medium text-brown-500 leading-relaxed whitespace-pre-line md:text-lg">
											{paragraph}
										</p>
									);
								})}
							</div>

							<div className="mb-8 bg-brown-200 rounded-2xl p-5 md:hidden">
								<p className="text-xs text-brown-400 mb-4">Author</p>
								<div className="flex items-center gap-3 pb-4 mb-4 border-b border-brown-300">
									<div className="w-10 h-10 rounded-full bg-brown-300 overflow-hidden shrink-0">
										{article.authorAvatar ? (
											<img src={article.authorAvatar} alt={article.authorName} className="w-full h-full object-cover" />
										) : null}
									</div>
									<p className="text-sm font-bold text-brown-500">{article.authorName}</p>
								</div>
								<p className="text-base font-medium text-brown-400 leading-relaxed mb-3">
									I am a food enthusiast and freelance writer who specializes in recipe development and home cooking. With a deep love for Thai cuisine, I enjoy sharing recipes, cooking tips, and stories behind every dish.
								</p>
								<p className="text-base font-medium text-brown-400 leading-relaxed">
									When I'm not writing, I spend my time exploring local markets and street food stalls, discovering new flavors to bring back to my kitchen.
								</p>
							</div>

							<div className="pt-6 mb-8 max-w-3xl">
								<div className="flex flex-col gap-3 w-full bg-brown-200 rounded-lg px-3 py-3 md:flex-row md:items-center md:justify-between md:px-6 md:py-4">
									<button
										onClick={handleLike}
										className={`flex items-center justify-center gap-1.5 w-full py-2 text-base font-medium rounded-full border transition-colors duration-150 md:w-auto md:px-10 md:py-2.5 ${liked ? 'bg-brown-600 text-white border-brown-600' : 'bg-white text-brown-500 border-brown-400 hover:bg-brown-100'}`}
									>
										<img src={happyLightIcon} alt="" className={`w-6 h-6 md:w-8 md:h-8 ${liked ? 'invert' : ''}`} />
										{likeCount}
									</button>

									<div className="flex items-center gap-2 md:gap-3">
										<button
											onClick={handleCopyLink}
											className="flex items-center gap-1.5 px-6 py-2.5 text-base font-medium text-brown-600 bg-white border border-brown-400 rounded-full hover:bg-brown-100 transition-colors duration-150 md:px-10 md:py-2.5"
										>
											<img src={copyLightIcon} alt="" className="w-6 h-6 md:w-8 md:h-8" />
											{copied ? 'Copied!' : 'Copy link'}
										</button>

										<div className="flex items-center gap-1 md:gap-2">
											<a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="hover:opacity-70 transition-opacity duration-150">
												<img src={facebookIcon} alt="" className="w-12 h-12" />
											</a>
											<a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="hover:opacity-70 transition-opacity duration-150">
												<img src={linkedinIcon} alt="" className="w-12 h-12" />
											</a>
											<a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="Share on X" className="hover:opacity-70 transition-opacity duration-150">
												<img src={twitterIcon} alt="" className="w-12 h-12" />
											</a>
										</div>
									</div>
								</div>
							</div>

							<div className="max-w-3xl">
								<p className="text-base text-brown-400 mb-3">Comment</p>
								<textarea
									value={commentText}
									onChange={(e) => setCommentText(e.target.value)}
									placeholder="What are your thoughts?"
									rows={3}
									className="w-full px-4 py-3 text-base text-brown-600 bg-white border border-brown-200 rounded-xl outline-none placeholder:text-brown-300 focus:border-brown-400 transition-colors duration-150 mb-3"
								/>
								<div className="flex justify-start mb-8">
									<button
										onClick={handleSendComment}
										className="px-10 py-3 text-base font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 transition-colors duration-150"
									>
										Send
									</button>
								</div>

								<div className="flex flex-col divide-y divide-brown-300">
									{comments.map((c) => (
										<div key={c.id} className="py-7">
											<div className="flex items-center gap-3 mb-3">
												<div className="w-9 h-9 rounded-full bg-brown-300 overflow-hidden shrink-0">
													{c.avatar ? (
														<img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
													) : null}
												</div>
												<div>
													<p className="text-lg font-semibold text-brown-600">{c.name}</p>
													<p className="text-xs text-brown-300">{c.date}</p>
												</div>
											</div>
											<p className="text-base text-brown-500 leading-relaxed">{c.text}</p>
										</div>
									))}
								</div>
							</div>
						</article>

						<aside className="hidden md:block">
							<div className="sticky top-32 bg-brown-200 rounded-2xl p-5">
								<p className="text-xs text-brown-400 mb-4">Author</p>
								<div className="flex items-center gap-3 pb-4 mb-4 border-b border-brown-300">
									<div className="w-10 h-10 rounded-full bg-brown-300 overflow-hidden shrink-0">
										{article.authorAvatar ? (
											<img src={article.authorAvatar} alt={article.authorName} className="w-full h-full object-cover" />
										) : null}
									</div>
									<p className="text-sm font-bold text-brown-500">{article.authorName}</p>
								</div>
								<p className="text-xs text-brown-400 leading-relaxed mb-3">
									I am a food enthusiast and freelance writer who specializes in recipe development and home cooking. With a deep love for Thai cuisine, I enjoy sharing recipes, cooking tips, and stories behind every dish.
								</p>
								<p className="text-xs text-brown-400 leading-relaxed">
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
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={() => setShowAuthModal(false)}>
					<div className="relative bg-white rounded-2xl px-12 py-14 w-full max-w-lg text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
						<button
							onClick={() => setShowAuthModal(false)}
							className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-brown-400 hover:text-brown-600 transition-colors duration-150"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
						<h2 className="text-4xl font-semibold text-brown-600 mb-8">Create an account to<br />continue</h2>
						<button
							onClick={() => { setShowAuthModal(false); navigate('/signup', { state: { from: location.pathname } }); }}
							className="px-12 py-3.5 text-base font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 transition-colors duration-150"
						>
							Create account
						</button>
						<p className="text-sm text-brown-400 mt-4">
							Already have an account?{' '}
							<Link to="/login" state={{ from: location.pathname }} onClick={() => setShowAuthModal(false)} className="font-medium text-brown-600 hover:underline">
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

