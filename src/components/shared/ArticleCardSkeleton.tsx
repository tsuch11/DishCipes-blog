// ── ArticleCardSkeleton ───────────────────────────────────────────────
// Skeleton placeholder shown while ArticleCard data loads

const ArticleCardSkeleton = () => (
	<div className="flex flex-col rounded-2xl p-3 -mx-3 animate-pulse">
		<div className="w-full aspect-video bg-brown-200 dark:bg-dark-elevated rounded-xl mb-3" />

		<div className="w-16 h-5 bg-brown-200 dark:bg-dark-elevated rounded-full mb-2" />

		<div className="space-y-1.5 mb-1">
			<div className="h-5 bg-brown-200 dark:bg-dark-elevated rounded-lg w-full" />
			<div className="h-5 bg-brown-200 dark:bg-dark-elevated rounded-lg w-3/4" />
		</div>

		<div className="space-y-1.5 mb-3">
			<div className="h-4 bg-brown-200 dark:bg-dark-elevated rounded-lg w-full" />
			<div className="h-4 bg-brown-200 dark:bg-dark-elevated rounded-lg w-5/6" />
		</div>

		<div className="flex items-center gap-2">
			<div className="w-6 h-6 rounded-full bg-brown-200 dark:bg-dark-elevated shrink-0" />
			<div className="h-4 w-20 bg-brown-200 dark:bg-dark-elevated rounded-lg" />
			<div className="h-4 w-px bg-brown-200 dark:bg-dark-elevated" />
			<div className="h-4 w-16 bg-brown-200 dark:bg-dark-elevated rounded-lg" />
		</div>
	</div>
);

export default ArticleCardSkeleton;
