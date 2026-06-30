// ── Navbar ────────────────────────────────────────────────────────────
// navigation bar ทุกหน้า (ยกเว้น AdminPage)
// แก้ไขได้: logo text, SCROLL_RANGE, TARGET_PILL_W, hamburger items, dropdown links

// ── Imports ───────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../types/notification';
import bellIcon from '../../assets/images/icons/Bell_light.svg';
import useDarkMode from '../../hooks/useDarkMode';

const timeAgo = (iso: string) => {
	const diff = Date.now() - new Date(iso).getTime();
	const min = Math.floor(diff / 60000);
	if (min < 60) return `${min}m ago`;
	const hr = Math.floor(min / 60);
	if (hr < 24) return `${hr}h ago`;
	return `${Math.floor(hr / 24)}d ago`;
};

const notifMsg = (n: Notification) => {
	const title = n.articleTitle ? `"${n.articleTitle}"` : '';
	switch (n.type) {
		case 'comment': return `commented on your article ${title}`;
		case 'reply': return `replied to your comment on ${title}`;
		case 'article_like': return `liked your article ${title}`;
		case 'comment_like': return `liked your comment on ${title}`;
		case 'follow': return 'started following you';
		case 'new_article': return `posted a new article ${title}`;
		default: return '';
	}
};

const notifLink = (n: Notification) =>
	n.type === 'follow' ? `/user/${n.actorUsername}` : `/article/${n.articleId}`;

// ── Constants ─────────────────────────────────────────────────────────

const SCROLL_RANGE = 300;
const TARGET_PILL_W = 820;

// ── Component ─────────────────────────────────────────────────────────

const Navbar = () => {

	// ── State & Refs ────────────────────────────────────────────────────

	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const { isDark, toggle: toggleDark } = useDarkMode();
	const [menuOpen, setMenuOpen] = useState(false);
	const [bellOpen, setBellOpen] = useState(false);
	const [hamburgerOpen, setHamburgerOpen] = useState(false);
	const [p, setP] = useState(0);
	const [vw, setVw] = useState(() => window.innerWidth);
	const menuRef = useRef<HTMLDivElement>(null);
	const bellRef = useRef<HTMLDivElement>(null);
	const headerRef = useRef<HTMLElement>(null);
	const targetP = useRef(0);
	const displayP = useRef(0);
	const rafId = useRef(0);

	// ── Data ─────────────────────────────────────────────────────────────

	const { notifications, unreadCount, markAllRead, deleteNotification, clearAll } = useNotifications();

	// ── Effects ──────────────────────────────────────────────────────────

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
			if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
			if (headerRef.current && !headerRef.current.contains(e.target as Node)) setHamburgerOpen(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	useEffect(() => {
		const onScroll = () => {
			targetP.current = Math.min(window.scrollY / SCROLL_RANGE, 1);
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	// RAF loop — ลง alpha 0.1 (~0.7s), ขึ้น alpha 0.07 (~1s)
	useEffect(() => {
		const tick = () => {
			const cur = displayP.current;
			const tgt = targetP.current;
			const diff = tgt - cur;
			if (Math.abs(diff) > 0.0005) {
				const alpha = diff > 0 ? 0.1 : 0.07;
				displayP.current = cur + diff * alpha;
				setP(displayP.current);
			}
			rafId.current = requestAnimationFrame(tick);
		};
		rafId.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafId.current);
	}, []);

	useEffect(() => {
		const onResize = () => setVw(window.innerWidth);
		window.addEventListener('resize', onResize, { passive: true });
		return () => window.removeEventListener('resize', onResize);
	}, []);

	// ── Handlers ─────────────────────────────────────────────────────────

	const handleLogout = () => {
		setMenuOpen(false);
		setHamburgerOpen(false);
		logout();
		navigate('/');
	};

	// ── Styles ────────────────────────────────────────────────────────────
	const B100 = isDark ? '28,25,23' : '249,248,246';
	const B300 = isDark ? '68,64,60' : '218,214,209';

	const isDesktop = vw >= 768;
	const endPx = isDesktop ? 32 : 16;
	const endPillW = Math.min(TARGET_PILL_W, vw - 32);
	const pillMaxW = vw - (vw - endPillW) * p;

	const headerStyle: CSSProperties = {
		backgroundColor: 'transparent',
		borderBottomColor: 'transparent',
		paddingLeft: `${p * endPx}px`,
		paddingRight: `${p * endPx}px`,
		paddingTop: `${p * 10}px`,
	};

	const pillStyle: CSSProperties = {
		maxWidth: `${pillMaxW}px`,
		marginLeft: 'auto',
		marginRight: 'auto',
		borderRadius: `${p * 9999}px`,
		backgroundColor: `rgba(${B100},${p * 0.98})`,
		boxShadow: `0 4px 24px rgba(0,0,0,${p * 0.1}),0 1px 8px rgba(0,0,0,${p * 0.05})`,
		border: `1px solid rgba(${B300},${p * 0.5})`,
		backdropFilter: isDark ? 'none' : `blur(${p * 12}px)`,
		WebkitBackdropFilter: isDark ? 'none' : `blur(${p * 12}px)`,
	};

	const navPy = (isDesktop ? 16 : 12) - p * (isDesktop ? 8 : 4);
	const navStyle: CSSProperties = {
		paddingTop: `${navPy}px`,
		paddingBottom: `${navPy}px`,
	};

	return (
		<header
			ref={headerRef}
			className="sticky top-0 z-50 border-b animate-fadeIn"
			style={headerStyle}
		>
			<div style={pillStyle}>
				<nav
					className="flex items-center justify-between max-w-7xl mx-auto px-4 md:px-10"
					style={navStyle}
				>
					<Link to="/" className="font-semibold text-brown-600 dark:text-brown-100" style={{ fontSize: 'clamp(2rem, 2vw, 1.5rem)' }}>DishCipes<span className="text-brand-green">.</span></Link>

					{/* ── Desktop nav ── */}
					<div className="hidden md:flex items-center gap-1">
						{/* Dark mode toggle */}
						<button
							onClick={toggleDark}
							className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-brown-200 dark:hover:bg-dark-elevated active:scale-90 transition-all duration-150"
							aria-label="Toggle dark mode"
						>
							{isDark ? (
								<svg className="w-4.5 h-4.5 text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
								</svg>
							) : (
								<svg className="w-4.5 h-4.5 text-brown-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
								</svg>
							)}
						</button>

						{user ? (
							<>
								{/* Bell / notifications */}
								<div className="relative" ref={bellRef}>
									<button
										onClick={() => { setBellOpen((prev) => { if (!prev) markAllRead(); return !prev; }); setMenuOpen(false); }}
										className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-brown-200 dark:hover:bg-dark-elevated active:scale-90 transition-all duration-150"
									>
										<img src={bellIcon} alt="Notifications" className="w-5 h-5" />
										{unreadCount > 0 && (
											<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
										)}
									</button>

									{bellOpen && (
										<div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white dark:bg-dark-surface border border-brown-200 dark:border-dark-border rounded-2xl shadow-xl dark:shadow-black/40 py-2 z-50 animate-slideDown">
											<div className="flex items-center justify-between px-4 py-2 border-b border-brown-100 dark:border-dark-border">
												<p className="text-xs font-semibold text-brown-400 dark:text-brown-300 uppercase tracking-wide">Notifications</p>
												{notifications.length > 0 && (
													<button
														onClick={clearAll}
														className="text-xs text-brown-400 dark:text-brown-300 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-150"
													>
														Clear all
													</button>
												)}
											</div>
											{notifications.length === 0 ? (
												<p className="px-4 py-6 text-sm text-brown-300 dark:text-brown-400 text-center">No notifications</p>
											) : (
												<ul className="max-h-72 overflow-y-auto">
													{notifications.map((n) => (
														<li key={n.id} className={`group flex items-start gap-3 px-4 py-3 ${!n.isRead ? 'bg-brown-50/60 dark:bg-dark-elevated/50' : ''} hover:bg-brown-50 dark:hover:bg-dark-elevated transition-colors duration-150`}>
															<button
																onClick={() => { setBellOpen(false); navigate(notifLink(n)); }}
																className="flex items-start gap-3 flex-1 min-w-0 text-left"
															>
																<div className="w-10 h-10 rounded-full overflow-hidden bg-brown-200 dark:bg-dark-elevated shrink-0 mt-0.5">
																	{n.actorAvatar ? (
																		<img src={n.actorAvatar} alt={n.actorName} className="w-full h-full object-cover" />
																	) : (
																		<div className="w-full h-full flex items-center justify-center">
																			<svg className="w-5 h-5 text-brown-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
																			</svg>
																		</div>
																	)}
																</div>
																<div className="flex-1 min-w-0">
																	<p className="text-sm text-brown-600 dark:text-brown-100 leading-snug">
																		<span className="font-semibold">{n.actorName}</span>{' '}
																		{notifMsg(n)}
																	</p>
																	<p className="text-xs text-brown-400 dark:text-brown-300 mt-1">{timeAgo(n.createdAt)}</p>
																</div>
																{!n.isRead && (
																	<span className="w-2 h-2 bg-red-400 rounded-full shrink-0 mt-1.5" />
																)}
															</button>
															<button
																onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
																className="shrink-0 flex items-center justify-center w-6 h-6 mt-0.5 rounded-full text-brown-300 dark:text-brown-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150 opacity-50 hover:opacity-100"
																aria-label="Delete notification"
															>
																<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
																</svg>
															</button>
														</li>
													))}
												</ul>
											)}
										</div>
									)}
								</div>

								{/* Avatar dropdown */}
								<div className="relative" ref={menuRef}>
									<button
										onClick={() => { setMenuOpen((prev) => !prev); setBellOpen(false); }}
										className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-brown-200 dark:hover:bg-dark-elevated active:scale-95 transition-all duration-150"
									>
										<div className="w-8 h-8 rounded-full overflow-hidden bg-brown-300 dark:bg-dark-elevated shrink-0">
											{user.avatar ? (
												<img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<svg className="w-4 h-4 text-brown-500 dark:text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
													</svg>
												</div>
											)}
										</div>
										<span className="text-sm font-medium text-brown-600 dark:text-brown-100">{user.name.split(' ')[0]}</span>
										<svg className="w-4 h-4 text-brown-400 dark:text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
										</svg>
									</button>

									{menuOpen && (
										<div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-dark-surface border border-brown-200 dark:border-dark-border rounded-2xl shadow-lg dark:shadow-black/40 py-2 z-50 animate-slideDown">
											<Link
												to="/profile"
												onClick={() => setMenuOpen(false)}
												className="flex items-center gap-2 px-4 py-2.5 text-sm text-brown-500 dark:text-brown-300 hover:bg-brown-100 dark:hover:bg-dark-elevated hover:text-brown-600 dark:hover:text-brown-100 transition-colors duration-150"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
												Profile
											</Link>
											<Link
												to="/profile/reset-password"
												onClick={() => setMenuOpen(false)}
												className="flex items-center gap-2 px-4 py-2.5 text-sm text-brown-500 dark:text-brown-300 hover:bg-brown-100 dark:hover:bg-dark-elevated hover:text-brown-600 dark:hover:text-brown-100 transition-colors duration-150"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
												</svg>
												Reset password
											</Link>
											{user.role === 'admin' && (
												<Link
													to="/admin/login"
													onClick={() => setMenuOpen(false)}
													className="flex items-center gap-2 px-4 py-2.5 text-sm text-brown-500 dark:text-brown-300 hover:bg-brown-100 dark:hover:bg-dark-elevated hover:text-brown-600 dark:hover:text-brown-100 transition-colors duration-150"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
													</svg>
													Admin panel
												</Link>
											)}
											<hr className="my-1 border-brown-200 dark:border-dark-border" />
											<button
												onClick={handleLogout}
												className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-brown-500 dark:text-brown-300 hover:bg-brown-100 dark:hover:bg-dark-elevated hover:text-brown-600 dark:hover:text-brown-100 transition-colors duration-150"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
												</svg>
												Log out
											</button>
										</div>
									)}
								</div>
							</>
						) : (
							<>
								<Link
									to="/login"
									className="px-10 py-3 text-base font-medium text-brown-600 dark:text-brown-100 border border-brown-400 dark:border-dark-border rounded-full hover:bg-brown-100 dark:hover:bg-dark-elevated active:scale-95 transition-all duration-150"
								>
									Log in
								</Link>
								<Link
									to="/signup"
									className="px-10 py-3 text-base font-medium text-white bg-brown-600 dark:bg-dark-elevated rounded-full hover:bg-brown-500 dark:hover:bg-dark-border active:scale-95 transition-all duration-150"
								>
									Sign up
								</Link>
							</>
						)}
					</div>

					{/* ── Mobile: dark toggle + hamburger ── */}
					<div className="flex items-center gap-1 md:hidden">
						<button
							onClick={toggleDark}
							className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-brown-200 dark:hover:bg-dark-elevated active:scale-90 transition-all duration-150"
							aria-label="Toggle dark mode"
						>
							{isDark ? (
								<svg className="w-4 h-4 text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
								</svg>
							) : (
								<svg className="w-4 h-4 text-brown-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
								</svg>
							)}
						</button>

						<button
							className="flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-md hover:bg-brown-200 dark:hover:bg-dark-elevated active:scale-90 transition-all duration-150"
							onClick={() => setHamburgerOpen((prev) => !prev)}
							aria-label="Menu"
						>
							<span className={`block w-5 h-0.5 bg-brown-600 dark:bg-brown-100 rounded-full transition-all duration-300 ${hamburgerOpen ? 'rotate-45 translate-y-2' : ''}`} />
							<span className={`block w-5 h-0.5 bg-brown-600 dark:bg-brown-100 rounded-full transition-all duration-300 ${hamburgerOpen ? 'opacity-0 scale-x-0' : ''}`} />
							<span className={`block w-5 h-0.5 bg-brown-600 dark:bg-brown-100 rounded-full transition-all duration-300 ${hamburgerOpen ? '-rotate-45 -translate-y-2' : ''}`} />
						</button>
					</div>
				</nav>
			</div>

			{/* ── Mobile dropdown overlay ── */}
			{hamburgerOpen && (
				<div className="md:hidden absolute top-full left-0 right-0 z-50 bg-brown-100 dark:bg-dark-bg border-b border-brown-300 dark:border-dark-border px-4 pt-4 pb-5 animate-slideDown">
					{user ? (
						<>
							<div className="flex items-center gap-3 pb-4 mb-2 border-b border-brown-200 dark:border-dark-border">
								<div className="w-10 h-10 rounded-full overflow-hidden bg-brown-300 dark:bg-dark-elevated shrink-0">
									{user.avatar ? (
										<img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<svg className="w-5 h-5 text-brown-500 dark:text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
											</svg>
										</div>
									)}
								</div>
								<span className="text-sm font-semibold text-brown-600 dark:text-brown-100">{user.name}</span>
							</div>
							<div className="flex flex-col">
								<Link
									to="/profile"
									onClick={() => setHamburgerOpen(false)}
									className="flex items-center gap-3 px-2 py-3 text-sm text-brown-500 dark:text-brown-300 hover:text-brown-600 dark:hover:text-brown-100 hover:bg-brown-200 dark:hover:bg-dark-elevated rounded-lg transition-colors duration-150"
								>
									<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
									Profile
								</Link>
								<Link
									to="/profile/reset-password"
									onClick={() => setHamburgerOpen(false)}
									className="flex items-center gap-3 px-2 py-3 text-sm text-brown-500 dark:text-brown-300 hover:text-brown-600 dark:hover:text-brown-100 hover:bg-brown-200 dark:hover:bg-dark-elevated rounded-lg transition-colors duration-150"
								>
									<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
									</svg>
									Reset password
								</Link>
								{user.role === 'admin' && (
									<Link
										to="/admin/login"
										onClick={() => setHamburgerOpen(false)}
										className="flex items-center gap-3 px-2 py-3 text-sm text-brown-500 dark:text-brown-300 hover:text-brown-600 dark:hover:text-brown-100 hover:bg-brown-200 dark:hover:bg-dark-elevated rounded-lg transition-colors duration-150"
									>
										<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
										</svg>
										Admin panel
									</Link>
								)}
								<hr className="my-2 border-brown-200 dark:border-dark-border" />
								<button
									onClick={handleLogout}
									className="flex items-center gap-3 w-full px-2 py-3 text-sm text-brown-500 dark:text-brown-300 hover:text-brown-600 dark:hover:text-brown-100 hover:bg-brown-200 dark:hover:bg-dark-elevated rounded-lg transition-colors duration-150"
								>
									<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
									</svg>
									Log out
								</button>
							</div>
						</>
					) : (
						<div className="flex flex-col gap-3">
							<Link
								to="/login"
								onClick={() => setHamburgerOpen(false)}
								className="w-full py-3.5 text-center text-sm font-medium text-brown-600 dark:text-brown-100 border border-brown-400 dark:border-dark-border rounded-full hover:bg-brown-200 dark:hover:bg-dark-elevated active:scale-95 transition-all duration-150"
							>
								Log in
							</Link>
							<Link
								to="/signup"
								onClick={() => setHamburgerOpen(false)}
								className="w-full py-3.5 text-center text-sm font-medium text-white bg-brown-600 dark:bg-dark-elevated rounded-full hover:bg-brown-500 dark:hover:bg-dark-border active:scale-95 transition-all duration-150"
							>
								Sign up
							</Link>
						</div>
					)}
				</div>
			)}
		</header>
	);
};

export default Navbar;
