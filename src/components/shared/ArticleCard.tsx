type ArticleCardProps = {
	image: string;
	category: string;
	title: string;
	description: string;
	authorName: string;
	authorAvatar: string;
	date: string;
};

const ArticleCard = ({ image, category, title, description, authorName, authorAvatar, date }: ArticleCardProps) => {
	return (
		<article className="flex flex-col cursor-pointer group">
			<div className="relative w-full aspect-video bg-brown-200 rounded-xl overflow-hidden mb-3">
				{image ? (
					<img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
				) : (
					<div className="absolute inset-0 bg-brown-300" />
				)}
			</div>

			<span className="w-fit px-2.5 py-0.5 text-xs font-medium text-brand-green bg-brand-green-light rounded-full mb-2">
				{category}
			</span>

			<h3 className="text-sm font-bold text-brown-600 leading-snug line-clamp-2 mb-1">
				{title}
			</h3>

			<p className="text-xs text-brown-400 leading-relaxed line-clamp-2 mb-3">
				{description}
			</p>

			<div className="flex items-center gap-2">
				<div className="w-6 h-6 rounded-full bg-brown-300 overflow-hidden shrink-0">
					{authorAvatar ? (
						<img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
					) : null}
				</div>
				<span className="text-xs font-medium text-brown-500">{authorName}</span>
				<span className="text-xs text-brown-300">|</span>
				<span className="text-xs text-brown-400">{date}</span>
			</div>
		</article>
	);
};

export default ArticleCard;
