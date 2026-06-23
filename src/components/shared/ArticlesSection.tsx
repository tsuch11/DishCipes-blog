// ArticlesSection — grid บทความพร้อม filter และ search
// แก้ไขได้: CATEGORIES list, INITIAL_COUNT (จำนวนบทความเริ่มต้น),
//           desktop tab bar style, mobile dropdown style, search input style,
//           "View more" button style, grid columns (sm:grid-cols-2)

import { useState, useMemo, useRef, useEffect } from 'react';
import { articles } from '../../data/articles';
import ArticleCard from './ArticleCard';
import ArticleCardSkeleton from './ArticleCardSkeleton';
import useScrollReveal from '../../animations/useScrollReveal';

const CATEGORIES = ['Highlight', 'Food', 'Dessert', 'Drinks'];
const INITIAL_COUNT = 6;
const SKELETON_COUNT = 4;

// articles section
const ArticlesSection = () => {
	const [activeCategory, setActiveCategory] = useState('Highlight');
	const [searchQuery, setSearchQuery] = useState('');
	const [showAll, setShowAll] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const { ref, visible } = useScrollReveal();

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	useEffect(() => {
		setLoading(true);
		const t = setTimeout(() => setLoading(false), 600);
		return () => clearTimeout(t);
	}, [activeCategory]);

	const handleCategoryChange = (cat: string) => {
		setActiveCategory(cat);
		setShowAll(false);
	};

	const filtered = useMemo(() => {
		const byCategory = activeCategory === 'Highlight'
			? articles
			: articles.filter((a) => a.category.toLowerCase() === activeCategory.toLowerCase());

		return searchQuery.trim() === ''
			? byCategory
			: byCategory.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
	}, [activeCategory, searchQuery]);

	const visible2 = activeCategory === 'Highlight' && !showAll
		? filtered.slice(0, INITIAL_COUNT)
		: filtered;

	const hasMore = activeCategory === 'Highlight' && !showAll && filtered.length > INITIAL_COUNT;

	return (
		<section
			ref={ref}
			className={`max-w-7xl mx-auto px-4 py-6 md:px-10 md:py-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
		>
			<h2 className="text-lg font-bold text-brown-600 dark:text-brown-100 mb-4 md:mb-5">Latest articles</h2>

			{/* ── Mobile: search + category custom dropdown ── */}
			<div className="md:hidden flex flex-col gap-3 mb-6">
				<div className="relative">
					<input
						type="text"
						placeholder="Search"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-4 pr-11 py-2.5 text-sm text-brown-600 dark:text-brown-100 bg-white dark:bg-dark-surface border border-brown-200 dark:border-dark-border rounded-xl outline-none placeholder:text-brown-300 dark:placeholder:text-brown-400 focus:border-brown-400 dark:focus:border-dark-border transition-colors duration-150"
					/>
					<svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400 dark:text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>

				<div className="flex items-center gap-3">
					<span className="text-sm text-brown-400 dark:text-brown-300 shrink-0">Category</span>
					<div className="relative flex-1" ref={dropdownRef}>
						<button
							onClick={() => setDropdownOpen((prev) => !prev)}
							className="w-full flex items-center justify-between pl-4 pr-3.5 py-2.5 text-sm text-brown-600 dark:text-brown-100 bg-white dark:bg-dark-surface border border-brown-200 dark:border-dark-border rounded-xl focus:border-brown-400 transition-colors duration-150 active:scale-[0.98]"
						>
							{activeCategory}
							<svg
								className={`w-4 h-4 text-brown-400 dark:text-brown-300 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
								fill="none" stroke="currentColor" viewBox="0 0 24 24"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
						</button>

						{dropdownOpen && (
							<div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-surface border border-brown-200 dark:border-dark-border rounded-xl shadow-lg dark:shadow-black/30 overflow-hidden z-20 animate-slideDown">
								{CATEGORIES.map((cat) => (
									<button
										key={cat}
										onClick={() => { handleCategoryChange(cat); setDropdownOpen(false); }}
										className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 active:scale-[0.98] ${activeCategory === cat ? 'bg-brown-100 dark:bg-dark-elevated text-brown-600 dark:text-brown-100 font-medium' : 'text-brown-500 dark:text-brown-300 hover:bg-brown-50 dark:hover:bg-dark-elevated'}`}
									>
										{cat}
									</button>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* ── Desktop: tab bar + search ── */}
			<div className="hidden md:flex items-center justify-between bg-brown-200 dark:bg-dark-surface px-5 py-4 rounded-lg mb-6">
				<div className="flex items-center gap-1 overflow-x-auto">
					{CATEGORIES.map((cat) => (
						<button
							key={cat}
							onClick={() => handleCategoryChange(cat)}
							className={`px-5 py-3 text-sm rounded-lg shrink-0 active:scale-95 transition-all duration-150 ${activeCategory === cat ? 'bg-brown-300 dark:bg-dark-elevated text-brown-600 dark:text-brown-100 shadow-sm font-medium' : 'text-brown-400 dark:text-brown-300 hover:text-brown-600 dark:hover:text-brown-100'}`}
						>
							{cat}
						</button>
					))}
				</div>
				<div className="relative shrink-0">
					<input
						type="text"
						placeholder="Search"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-72 pl-3 pr-9 py-3 text-sm font-normal text-brown-600 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-brown-300 dark:border-dark-border rounded-lg outline-none placeholder:text-brown-400 dark:placeholder:text-brown-400"
					/>
					<svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-brown-400 dark:text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>
			</div>

			{loading ? (
				<div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-6">
					{Array.from({ length: SKELETON_COUNT }).map((_, i) => (
						<ArticleCardSkeleton key={i} />
					))}
				</div>
			) : visible2.length > 0 ? (
				<div key={activeCategory} className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-6 animate-fadeInUp" style={{ animationDuration: '1s' }}>
					{visible2.map((article) => (
						<ArticleCard key={article.id} {...article} />
					))}
				</div>
			) : (
				<div className="py-16 text-center text-sm text-brown-300 dark:text-brown-400">
					No articles found.
				</div>
			)}

			{(hasMore || (activeCategory === 'Highlight' && showAll)) && (
				<div className="flex justify-center mt-10">
					<button
						onClick={() => setShowAll(!showAll)}
						className="cursor-pointer px-6 py-2 text-sm font-medium text-brown-500 dark:text-brown-300 border border-brown-300 dark:border-dark-border rounded-full hover:bg-brown-200 dark:hover:bg-dark-surface hover:text-brown-600 dark:hover:text-brown-100 hover:border-brown-400 dark:hover:border-dark-border hover:-translate-y-1 hover:shadow-md active:scale-95 transition-all duration-200"
					>
						{showAll ? 'View less' : 'View more'}
					</button>
				</div>
			)}
		</section>
	);
};

export default ArticlesSection;
