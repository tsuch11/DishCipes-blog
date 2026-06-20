import { useState, useMemo } from 'react';
import { articles } from '../../data/articles';
import ArticleCard from './ArticleCard';

const tabs = ['Highlight', 'Food', 'Dessert', 'drinks'];
const INITIAL_COUNT = 6;

const ArticlesSection = () => {
	const [activeTab, setActiveTab] = useState('Highlight');
	const [searchQuery, setSearchQuery] = useState('');
	const [showAll, setShowAll] = useState(false);

	const handleTabChange = (tab: string) => {
		setActiveTab(tab);
		setShowAll(false);
	};

	const filtered = useMemo(() => {
		const byTab = activeTab === 'Highlight'
			? articles
			: articles.filter((a) => a.category.toLowerCase() === activeTab.toLowerCase());

		return searchQuery.trim() === ''
			? byTab
			: byTab.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
	}, [activeTab, searchQuery]);

	const visible = activeTab === 'Highlight' && !showAll
		? filtered.slice(0, INITIAL_COUNT)
		: filtered;

	const hasMore = activeTab === 'Highlight' && !showAll && filtered.length > INITIAL_COUNT;

	return (
		<section className="max-w-7xl mx-auto px-4 py-6 md:px-10 md:py-8">
			<h2 className="text-lg font-bold text-brown-600 mb-4 md:mb-5">Latest Recipes</h2>

			<div className="flex items-center justify-between bg-brown-200 px-2 py-3 rounded-lg mb-6">
				<div className="flex items-center gap-1 overflow-x-auto">
					{tabs.map((tab) => (
						<button
							key={tab}
							onClick={() => handleTabChange(tab)}
							className={`px-4 py-2 text-xs font-sm rounded-lg shrink-0 transition-colors duration-150 ${activeTab === tab ? 'bg-brown-300 text-brown-600 shadow-sm' : 'text-brown-400 hover:text-brown-600'}`}
						>
							{tab}
						</button>
					))}
				</div>

				<div className="relative shrink-0">
					<input
						type="text"
						placeholder="Search"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-60 pl-3 pr-9 py-1.5 text-xs text-brown-600 bg-white rounded-sm outline-none placeholder:text-brown-400"
					/>
					<svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-brown-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>
			</div>

			{visible.length > 0 ? (
				<div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-6">
					{visible.map((article) => (
						<ArticleCard key={article.id} {...article} />
					))}
				</div>
			) : (
				<div className="py-16 text-center text-sm text-brown-300">
					No articles found.
				</div>
			)}

			{(hasMore || (activeTab === 'Highlight' && showAll)) && (
				<div className="flex justify-center mt-10">
					<button
						onClick={() => setShowAll(!showAll)}
						className="cursor-pointer px-6 py-2 text-sm font-medium text-brown-500 border border-brown-300 rounded-full hover:bg-brown-200 hover:text-brown-600 hover:border-brown-400 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
					>
						{showAll ? 'View less' : 'View more'}
					</button>
				</div>
			)}
		</section>
	);
};

export default ArticlesSection;
