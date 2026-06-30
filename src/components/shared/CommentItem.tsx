// ── CommentItem ───────────────────────────────────────────────────────
// Single comment with like button, reply toggle, and replies list
// แก้ไขได้: avatar size, like icon, reply indent style

import type { Comment } from '../../types/comment';

type Props = {
	comment: Comment;
	openReplyId: number | null;
	replyText: string;
	onLike: (id: number) => void;
	onReplyToggle: (id: number) => void;
	onReplyTextChange: (id: number, text: string) => void;
	onReply: (id: number) => void;
};

const CommentItem = ({ comment: c, openReplyId, replyText, onLike, onReplyToggle, onReplyTextChange, onReply }: Props) => {
	const isReplyOpen = openReplyId === c.id;

	return (
		<div className="py-7">
			<div className="flex items-center gap-3 mb-3">
				<div className="w-9 h-9 rounded-full bg-brown-300 dark:bg-dark-elevated overflow-hidden shrink-0">
					{c.avatar ? (
						<img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
					) : null}
				</div>
				<div>
					<p className="text-lg font-semibold text-brown-600 dark:text-brown-100">{c.name}</p>
					<p className="text-xs text-brown-300 dark:text-brown-400">{c.date}</p>
				</div>
			</div>

			<p className="text-base text-brown-500 dark:text-brown-200 leading-relaxed mb-3">{c.text}</p>

			<div className="flex items-center gap-4">
				<button
					onClick={() => onLike(c.id)}
					className={`flex items-center gap-1.5 text-sm transition-colors duration-150 ${c.likedByMe ? 'text-brown-600 dark:text-brown-100 font-medium' : 'text-brown-400 dark:text-brown-300 hover:text-brown-600 dark:hover:text-brown-100'}`}
				>
					<svg className="w-4 h-4" fill={c.likedByMe ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
					</svg>
					{c.likes}
				</button>
				<button
					onClick={() => onReplyToggle(c.id)}
					className="text-sm text-brown-400 dark:text-brown-300 hover:text-brown-600 dark:hover:text-brown-100 transition-colors duration-150"
				>
					Reply
				</button>
			</div>

			{isReplyOpen && (
				<div className="mt-3 pl-4 border-l-2 border-brown-200 dark:border-dark-border">
					<textarea
						value={replyText}
						onChange={(e) => onReplyTextChange(c.id, e.target.value)}
						placeholder="Write a reply..."
						rows={2}
						className="w-full px-3 py-2 text-sm text-brown-600 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-brown-200 dark:border-dark-border rounded-xl outline-none placeholder:text-brown-300 dark:placeholder:text-brown-400 focus:border-brown-400 dark:focus:border-dark-border transition-colors duration-150 mb-2"
					/>
					<button
						onClick={() => onReply(c.id)}
						className="px-6 py-1.5 text-sm font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 transition-colors duration-150"
					>
						Send
					</button>
				</div>
			)}

			{c.replies.length > 0 && (
				<div className="mt-4 pl-4 border-l-2 border-brown-200 dark:border-dark-border flex flex-col gap-4">
					{c.replies.map((r) => (
						<div key={r.id} className="flex items-start gap-3">
							<div className="w-7 h-7 rounded-full bg-brown-300 dark:bg-dark-elevated overflow-hidden shrink-0">
								{r.avatar ? <img src={r.avatar} alt={r.name} className="w-full h-full object-cover" /> : null}
							</div>
							<div>
								<p className="text-sm font-semibold text-brown-600 dark:text-brown-100">{r.name}</p>
								<p className="text-xs text-brown-300 dark:text-brown-400 mb-1">{r.date}</p>
								<p className="text-sm text-brown-500 dark:text-brown-200 leading-relaxed">{r.text}</p>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default CommentItem;
