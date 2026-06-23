// ArticleCard — card แสดงตัวอย่างบทความ ใช้ใน ArticlesSection และ AdminPage
// แก้ไขได้: card hover offset (-translate-y-1), image aspect ratio (aspect-video),
//           category badge color (brand-green), title line clamp (2), description line clamp (2),
//           author avatar size, date format

import { Link } from 'react-router-dom';
import type { Article } from '../../types/article';

type ArticleCardProps = Pick<Article, 'id' | 'image' | 'category' | 'title' | 'description' | 'authorName' | 'authorAvatar' | 'date'>;

// card
const ArticleCard = ({ id, image, category, title, description, authorName, authorAvatar, date }: ArticleCardProps) => {
	return (
		<Link
			to={`/article/${id}`}
			className="flex flex-col group rounded-2xl p-3 -mx-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-black/30 active:scale-[0.99]"
		>
			<div className="relative w-full aspect-video bg-brown-200 dark:bg-dark-elevated rounded-xl overflow-hidden mb-3">
				{image ? (
					<img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
				) : (
					<div className="absolute inset-0 bg-brown-300 dark:bg-dark-border" />
				)}
			</div>

			<span className="w-fit px-2.5 py-0.5 text-xs font-medium text-brand-green bg-brand-green-light dark:bg-brand-green/15 rounded-full mb-2">
				{category}
			</span>

			<h3 className="text-xl font-semibold text-brown-600 dark:text-brown-100 leading-snug line-clamp-2 mb-1">
				{title}
			</h3>

			<p className="text-sm text-brown-400 dark:text-brown-300 leading-relaxed line-clamp-2 mb-3">
				{description}
			</p>

			<div className="flex items-center gap-2">
				<div className="w-6 h-6 rounded-full bg-brown-300 dark:bg-dark-elevated overflow-hidden shrink-0">
					{authorAvatar ? (
						<img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
					) : null}
				</div>
				<span className="text-sm font-medium text-brown-500 dark:text-brown-200">{authorName}</span>
				<span className="text-sm text-brown-300 dark:text-dark-border">|</span>
				<span className="text-sm text-brown-400 dark:text-brown-300">{date}</span>
			</div>
		</Link>
	);
};

export default ArticleCard;
