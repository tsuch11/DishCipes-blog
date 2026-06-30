// ── CommentItem ───────────────────────────────────────────────────────
// Single comment + replies with like, reply, edit/delete via ⋮ menu for owner and admin
// แก้ไขได้: avatar size, like icon, reply indent style, menu position

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Comment } from '../../types/comment';

// ── Types ──────────────────────────────────────────────────────────────
type Props = {
	comment: Comment;
	openReplyId: number | null;
	replyText: string;
	currentUserId: string;
	isAdmin: boolean;
	onLike: (id: number) => void;
	onReplyToggle: (id: number) => void;
	onReplyTextChange: (id: number, text: string) => void;
	onReply: (id: number) => void;
	onReplyLike: (replyId: number, commentId: number) => void;
	onReplyToReply: (commentId: number, authorName: string, authorUserId: string) => void;
	onEdit: (commentId: number, newText: string) => void;
	onDelete: (commentId: number) => void;
	onEditReply: (replyId: number, commentId: number, newText: string) => void;
	onDeleteReply: (replyId: number, commentId: number) => void;
};

// ── Component ──────────────────────────────────────────────────────────
const CommentItem = ({ comment: c, openReplyId, replyText, currentUserId, isAdmin, onLike, onReplyToggle, onReplyTextChange, onReply, onReplyLike, onReplyToReply, onEdit, onDelete, onEditReply, onDeleteReply }: Props) => {
	const isReplyOpen = openReplyId === c.id;
	const isOwner = c.userId === currentUserId;
	const canMenu = isOwner || isAdmin;

	// ── Hooks ─────────────────────────────────────────────────────────
	const [menuOpen, setMenuOpen] = useState(false);
	const [editing, setEditing] = useState(false);
	const [editText, setEditText] = useState(c.text);

	const [replyMenuOpenId, setReplyMenuOpenId] = useState<number | null>(null);
	const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
	const [replyEditText, setReplyEditText] = useState('');

	const menuRef = useRef<HTMLDivElement>(null);
	const replyMenuRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	useEffect(() => {
		if (replyMenuOpenId === null) return;
		const handler = (e: MouseEvent) => {
			if (replyMenuRef.current && !replyMenuRef.current.contains(e.target as Node)) setReplyMenuOpenId(null);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [replyMenuOpenId]);

	// ── Handlers ──────────────────────────────────────────────────────
	const handleSaveEdit = () => {
		const trimmed = editText.trim();
		if (!trimmed) return;
		onEdit(c.id, trimmed);
		setEditing(false);
	};

	const handleSaveReplyEdit = (replyId: number) => {
		const trimmed = replyEditText.trim();
		if (!trimmed) return;
		onEditReply(replyId, c.id, trimmed);
		setEditingReplyId(null);
	};

	// ── Render ────────────────────────────────────────────────────────
	return (
		<div className="py-7">
			{/* ── Comment header ── */}
			<div className="flex items-center gap-3 mb-3">
				<Link to={`/user/${c.username}`} className="w-9 h-9 rounded-full bg-brown-300 dark:bg-dark-elevated overflow-hidden shrink-0">
					{c.avatar ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" /> : null}
				</Link>
				<div className="flex-1 min-w-0">
					<Link to={`/user/${c.username}`} className="text-lg font-semibold text-brown-600 dark:text-brown-100 hover:underline">{c.name}</Link>
					<p className="text-xs text-brown-300 dark:text-brown-400">{c.date}</p>
				</div>

				{canMenu && (
					<div className="relative shrink-0" ref={menuRef}>
						<button
							onClick={() => setMenuOpen((prev) => !prev)}
							className="flex items-center justify-center w-7 h-7 rounded-full text-brown-400 dark:text-brown-300 hover:bg-brown-200 dark:hover:bg-dark-elevated hover:text-brown-600 dark:hover:text-brown-100 transition-colors duration-150"
						>
							<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
								<circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
							</svg>
						</button>
						{menuOpen && (
							<div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-dark-surface border border-brown-200 dark:border-dark-border rounded-xl shadow-lg dark:shadow-black/30 py-1 z-20">
								{isOwner && (
									<button
										onClick={() => { setEditing(true); setEditText(c.text); setMenuOpen(false); }}
										className="flex items-center gap-2 w-full px-3 py-2 text-sm text-brown-500 dark:text-brown-300 hover:bg-brown-50 dark:hover:bg-dark-elevated hover:text-brown-600 dark:hover:text-brown-100 transition-colors duration-150"
									>
										<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
										Edit
									</button>
								)}
								<button
									onClick={() => { onDelete(c.id); setMenuOpen(false); }}
									className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
								>
									<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
									Delete
								</button>
							</div>
						)}
					</div>
				)}
			</div>

			{/* ── Comment text / edit mode ── */}
			{editing ? (
				<div className="mb-3">
					<textarea
						value={editText}
						onChange={(e) => setEditText(e.target.value)}
						rows={3}
						className="w-full px-3 py-2 text-sm text-brown-600 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-brown-200 dark:border-dark-border rounded-xl outline-none focus:border-brown-400 dark:focus:border-dark-border transition-colors duration-150 mb-2"
					/>
					<div className="flex gap-2">
						<button onClick={handleSaveEdit} className="px-5 py-1.5 text-sm font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 transition-colors duration-150">Save</button>
						<button onClick={() => setEditing(false)} className="px-5 py-1.5 text-sm font-medium text-brown-500 dark:text-brown-300 border border-brown-300 dark:border-dark-border rounded-full hover:bg-brown-100 dark:hover:bg-dark-elevated transition-colors duration-150">Cancel</button>
					</div>
				</div>
			) : (
				<p className="text-base text-brown-500 dark:text-brown-200 leading-relaxed mb-3">{c.text}</p>
			)}

			{/* ── Comment actions ── */}
			{!editing && (
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
			)}

			{/* ── Reply input ── */}
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

			{/* ── Replies ── */}
			{c.replies.length > 0 && (
				<div className="mt-4 pl-4 border-l-2 border-brown-200 dark:border-dark-border flex flex-col gap-5">
					{c.replies.map((r) => {
						const isReplyOwner = r.userId === currentUserId;
						const canReplyMenu = isReplyOwner || isAdmin;
						const isEditingThisReply = editingReplyId === r.id;

						return (
							<div key={r.id} className="flex items-start gap-3">
								<Link to={`/user/${r.username}`} className="w-7 h-7 rounded-full bg-brown-300 dark:bg-dark-elevated overflow-hidden shrink-0 mt-0.5">
									{r.avatar ? <img src={r.avatar} alt={r.name} className="w-full h-full object-cover" /> : null}
								</Link>
								<div className="flex-1 min-w-0">
									<div className="flex items-start gap-2">
										<div className="flex-1 min-w-0">
											<Link to={`/user/${r.username}`} className="text-sm font-semibold text-brown-600 dark:text-brown-100 hover:underline">{r.name}</Link>
											<p className="text-xs text-brown-300 dark:text-brown-400 mb-1">{r.date}</p>
										</div>

										{canReplyMenu && (
											<div
												className="relative shrink-0"
												ref={(node) => { if (replyMenuOpenId === r.id) replyMenuRef.current = node; }}
											>
												<button
													onClick={() => setReplyMenuOpenId((prev) => prev === r.id ? null : r.id)}
													className="flex items-center justify-center w-7 h-7 rounded-full text-brown-400 dark:text-brown-300 hover:bg-brown-200 dark:hover:bg-dark-elevated hover:text-brown-600 dark:hover:text-brown-100 transition-colors duration-150"
												>
													<svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
														<circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
													</svg>
												</button>
												{replyMenuOpenId === r.id && (
													<div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-dark-surface border border-brown-200 dark:border-dark-border rounded-xl shadow-lg dark:shadow-black/30 py-1 z-20">
														{isReplyOwner && (
															<button
																onClick={() => { setEditingReplyId(r.id); setReplyEditText(r.text); setReplyMenuOpenId(null); }}
																className="flex items-center gap-2 w-full px-3 py-2 text-sm text-brown-500 dark:text-brown-300 hover:bg-brown-50 dark:hover:bg-dark-elevated hover:text-brown-600 dark:hover:text-brown-100 transition-colors duration-150"
															>
																<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
																</svg>
																Edit
															</button>
														)}
														<button
															onClick={() => { onDeleteReply(r.id, c.id); setReplyMenuOpenId(null); }}
															className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
														>
															<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
															</svg>
															Delete
														</button>
													</div>
												)}
											</div>
										)}
									</div>

									{isEditingThisReply ? (
										<div className="mb-2">
											<textarea
												value={replyEditText}
												onChange={(e) => setReplyEditText(e.target.value)}
												rows={2}
												className="w-full px-3 py-2 text-sm text-brown-600 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-brown-200 dark:border-dark-border rounded-xl outline-none focus:border-brown-400 dark:focus:border-dark-border transition-colors duration-150 mb-2"
											/>
											<div className="flex gap-2">
												<button onClick={() => handleSaveReplyEdit(r.id)} className="px-4 py-1 text-xs font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 transition-colors duration-150">Save</button>
												<button onClick={() => setEditingReplyId(null)} className="px-4 py-1 text-xs font-medium text-brown-500 dark:text-brown-300 border border-brown-300 dark:border-dark-border rounded-full hover:bg-brown-100 dark:hover:bg-dark-elevated transition-colors duration-150">Cancel</button>
											</div>
										</div>
									) : (
										<p className="text-sm text-brown-500 dark:text-brown-200 leading-relaxed mb-2">{r.text}</p>
									)}

									{!isEditingThisReply && (
										<div className="flex items-center gap-3">
											<button
												onClick={() => onReplyLike(r.id, c.id)}
												className={`flex items-center gap-1 text-xs transition-colors duration-150 ${r.likedByMe ? 'text-brown-600 dark:text-brown-100 font-medium' : 'text-brown-400 dark:text-brown-300 hover:text-brown-600 dark:hover:text-brown-100'}`}
											>
												<svg className="w-3.5 h-3.5" fill={r.likedByMe ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
												</svg>
												{r.likes}
											</button>
											<button
												onClick={() => onReplyToReply(c.id, r.name, r.userId)}
												className="text-xs text-brown-400 dark:text-brown-300 hover:text-brown-600 dark:hover:text-brown-100 transition-colors duration-150"
											>
												Reply
											</button>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default CommentItem;
