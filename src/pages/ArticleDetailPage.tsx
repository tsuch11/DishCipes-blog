import { useParams, Link } from 'react-router-dom';
import { articles } from '../data/articles';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const ArticleDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const article = articles.find((a) => a.id === Number(id));

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
				<article className="max-w-2xl mx-auto px-4 py-8 md:px-6 md:py-12">
					<Link to="/" className="inline-flex items-center gap-1.5 text-sm text-brown-400 hover:text-brown-600 transition-colors duration-150 mb-6">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						Latest Recipes
					</Link>

					<div className="relative w-full aspect-video bg-brown-200 rounded-2xl overflow-hidden mb-6">
						{article.image ? (
							<img src={article.image} alt={article.title} className="absolute inset-0 w-full h-full object-cover" />
						) : (
							<div className="absolute inset-0 bg-brown-300" />
						)}
					</div>

					<span className="inline-block px-2.5 py-0.5 text-xs font-medium text-brand-green bg-brand-green-light rounded-full mb-3">
						{article.category}
					</span>

					<h1 className="text-2xl font-bold text-brown-600 leading-tight mb-4 md:text-3xl">
						{article.title}
					</h1>

					<div className="flex items-center gap-3 mb-8 pb-8 border-b border-brown-200">
						<div className="w-8 h-8 rounded-full bg-brown-300 overflow-hidden shrink-0">
							{article.authorAvatar ? (
								<img src={article.authorAvatar} alt={article.authorName} className="w-full h-full object-cover" />
							) : null}
						</div>
						<div className="flex items-center gap-2 text-xs text-brown-400">
							<span className="font-medium text-brown-500">{article.authorName}</span>
							<span className="text-brown-300">|</span>
							<span>{article.date}</span>
							{article.readTime ? (
								<>
									<span className="text-brown-300">|</span>
									<span>{article.readTime} min read</span>
								</>
							) : null}
						</div>
					</div>

					<div className="flex flex-col gap-5">
						{article.content?.map((paragraph, index) => (
							<p key={index} className="text-sm text-brown-500 leading-relaxed md:text-base">
								{paragraph}
							</p>
						))}
					</div>

					<div className="flex items-center gap-4 mt-10 pt-8 border-t border-brown-200">
						<button className="flex items-center gap-1.5 text-xs text-brown-400 hover:text-brown-600 transition-colors duration-150">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
							</svg>
							Like
						</button>
						<button className="flex items-center gap-1.5 text-xs text-brown-400 hover:text-brown-600 transition-colors duration-150">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
							Comment
						</button>
						<button className="flex items-center gap-1.5 text-xs text-brown-400 hover:text-brown-600 transition-colors duration-150">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
							</svg>
							Share
						</button>
					</div>
				</article>
			</main>

			<Footer />
		</div>
	);
};

export default ArticleDetailPage;
