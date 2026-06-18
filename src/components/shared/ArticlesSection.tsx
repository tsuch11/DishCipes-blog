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

const tabs = ['Highlight', 'Cat', 'Inspiration', 'General'];

const articles: Article[] = [
	{
		id: 1,
		image: '',
		category: 'Food',
		title: 'Understanding Cat Behavior: Why Your Feline Friend Acts the Way They Do',
		description: 'Dive into the curious world of cat behavior, exploring why cats knead, purr, and chase imaginary prey. This article helps pet owners decode their feline\'s actions.',
		authorName: 'Teerapat N.',
		authorAvatar: '',
		date: '11 September 2024',
	},
	{
		id: 2,
		image: '',
		category: 'Food',
		title: 'The Fascinating World of Cats: Why We Love Our Furry Friends',
		description: 'Cats have captivated human hearts for thousands of years. Whether lounging in a sunny spot or playfully chasing a string, these furry companions bring warmth.',
		authorName: 'Teerapat N.',
		authorAvatar: '',
		date: '11 September 2024',
	},
	{
		id: 3,
		image: '',
		category: 'Food',
		title: 'Finding Motivation: How to Stay Inspired Through Life\'s Challenges',
		description: 'This article explores strategies to maintain motivation when faced with personal or professional challenges. From setting small goals to practicing mindfulness.',
		authorName: 'Teerapat N.',
		authorAvatar: '',
		date: '11 September 2024',
	},
	{
		id: 4,
		image: '',
		category: 'Food',
		title: 'The Science of the Cat\'s Purr: How It Benefits Cats and Humans Alike',
		description: 'Discover the fascinating science behind the cat\'s purr, including its potential healing properties for both cats and humans. Learn how this unique sound is produced.',
		authorName: 'Teerapat N.',
		authorAvatar: '',
		date: '11 September 2024',
	},
	{
		id: 5,
		image: '',
		category: 'Food',
		title: 'Unlocking Creativity: Simple Habits to Spark Inspiration Daily',
		description: 'Discover practical ways to nurture creativity in your everyday life. Whether it\'s through journaling, taking breaks, or exploring new hobbies, this article offers simple tips.',
		authorName: 'Teerapat N.',
		authorAvatar: '',
		date: '11 September 2024',
	},
	{
		id: 6,
		image: '',
		category: 'Food',
		title: 'Top 10 Health Tips to Keep Your Cat Happy and Healthy',
		description: 'This guide offers essential tips on keeping your cat in peak health. Covering topics like proper nutrition, regular vet visits, grooming, and mental stimulation.',
		authorName: 'Teerapat N.',
		authorAvatar: '',
		date: '11 September 2024',
	},
];

const ArticlesSection = () => {
	const [activeTab, setActiveTab] = useState('Highlight');
	const [searchQuery, setSearchQuery] = useState('');

	return (
		<section className="max-w-4xl mx-auto px-6 py-8">
			<h2 className="text-lg font-bold text-brown-600 mb-5">Latest articles</h2>

			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-1 bg-brown-200 p-1 rounded-full">
					{tabs.map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-150 ${activeTab === tab ? 'bg-white text-brown-600 shadow-sm' : 'text-brown-400 hover:text-brown-600'}`}
						>
							{tab}
						</button>
					))}
				</div>

				<div className="relative">
					<input
						type="text"
						placeholder="Search"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-48 pl-4 pr-10 py-2 text-sm text-brown-600 bg-white border border-brown-200 rounded-full outline-none placeholder:text-brown-300 focus:border-brown-400 transition-colors duration-150"
					/>
					<svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-x-6 gap-y-8">
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
