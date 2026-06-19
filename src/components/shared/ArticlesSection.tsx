import { useState } from 'react';
import ArticleCard from './ArticleCard';

type Article = {
	id: number;
	image: string;
	category: string;
	title: string;
	description: string;
	authorName: string;
	authorAvatar: string;
	date: string;
};

const tabs = ['Highlight', 'Food', 'Dessert', 'drinks'];

const articles: Article[] = [
	{
		id: 1,
		image: '/src/assets/images/food/Tom_yum_kung.jpg',
		category: 'Food',
		title: 'Tom Yum Kung',
		description: "Dive into the bold, aromatic world of Thailand's most famous soup. This article explores the perfect balance of spicy, sour, and savory flavors, and shares tips on selecting the freshest shrimp and herbs...",
		authorName: 'Teerapat N.',
		authorAvatar: '',
		date: '11 September 2024',
	},
	{
		id: 2,
		image: '/src/assets/images/food/Padthai.jpg',
		category: 'Food',
		title: 'Pad Thai',
		description: "Discover the story behind Thailand's beloved street food classic. From the tangy tamarind sauce to the perfect wok-fried noodle texture, learn what makes an authentic Pad Thai truly unforgettable...",
		authorName: 'Teerapat N.',
		authorAvatar: '',
		date: '11 September 2024',
	},
	{
		id: 3,
		image: '/src/assets/images/food/Pad_kra_pao.jpg',
		category: 'Food',
		title: 'Pad Kra Pao',
		description: "Explore the fiery simplicity of this Thai stir-fry staple. This article breaks down the key ingredients, from holy basil to chili, and shares techniques for getting that signature smoky wok flavor...",
		authorName: 'Teerapat N.',
		authorAvatar: '',
		date: '11 September 2024',
	},
	{
		id: 4,
		image: '/src/assets/images/food/Spaghetti_carbonara.jpg',
		category: 'Food',
		title: 'Spaghetti Carbonara',
		description: "Uncover the secrets behind this creamy Italian classic. Learn the traditional technique using eggs, cheese, and pancetta, and why authentic carbonara never needs cream...",
		authorName: 'Teerapat N.',
		authorAvatar: '',
		date: '11 September 2024',
	},
	{
		id: 5,
		image: '/src/assets/images/food/Tonkatsu_don.jpg',
		category: 'Food',
		title: 'Tonkatsu Don',
		description: "Get to know the crispy, comforting world of Japanese tonkatsu rice bowls. This guide covers the perfect breading technique, the right cut of pork, and the savory-sweet sauce that ties it all together...",
		authorName: 'Teerapat N.',
		authorAvatar: '',
		date: '11 September 2024',
	},
	{
		id: 6,
		image: '/src/assets/images/food/Mango_sticky_rice.jpg',
		category: 'Dessert',
		title: 'Mango Sticky Rice',
		description: "Indulge in Thailand's most iconic dessert. This article explores how to achieve perfectly sticky coconut rice paired with ripe mango, plus tips for the ideal coconut sauce...",
		authorName: 'Teerapat N.',
		authorAvatar: '',
		date: '11 September 2024',
	},
];

const ArticlesSection = () => {
	const [activeTab, setActiveTab] = useState('Highlight');
	const [searchQuery, setSearchQuery] = useState('');

	return (
		<section className="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8">
			<h2 className="text-lg font-bold text-brown-600 mb-4 md:mb-5">Latest Recipes</h2>

			<div className="flex flex-col gap-3 mb-6 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-1 bg-brown-200 p-1 rounded-full overflow-x-auto">
					{tabs.map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`px-3 py-1 text-xs font-medium rounded-full shrink-0 transition-colors duration-150 md:px-4 md:py-1.5 md:text-sm ${activeTab === tab ? 'bg-white text-brown-600 shadow-sm' : 'text-brown-400 hover:text-brown-600'}`}
						>
							{tab}
						</button>
					))}
				</div>

				<div className="relative w-full md:w-48">
					<input
						type="text"
						placeholder="Search"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-4 pr-10 py-2 text-sm text-brown-600 bg-white border border-brown-200 rounded-full outline-none placeholder:text-brown-300 focus:border-brown-400 transition-colors duration-150"
					/>
					<svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-6">
				{articles.map((article) => (
					<ArticleCard key={article.id} {...article} />
				))}
			</div>

			<div className="flex justify-center mt-10">
				<button className="text-sm font-medium text-brown-500 underline underline-offset-4 hover:text-brown-600 transition-colors duration-150">
					View more
				</button>
			</div>
		</section>
	);
};

export default ArticlesSection;
