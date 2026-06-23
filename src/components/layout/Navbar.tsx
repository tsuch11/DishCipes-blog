// Navbar — navigation bar ทุกหน้า (ยกเว้น AdminPage)
// แก้ไขได้: logo text ("hh."), SCROLL_RANGE (px ที่ใช้ morph เต็ม), TARGET_PILL_W (ความกว้าง pill),
//           hamburger menu items, desktop dropdown links, notification list, backdrop-blur intensity

import { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MOCK_NOTIFICATIONS } from '../../data/notifications';
import bellIcon from '../../assets/images/icons/Bell_light.svg';

// ── brown-100 = #F9F8F6 = rgb(249,248,246)   brown-300 = #DAD6D1 = rgb(218,214,209)
const B100 = '249,248,246';
const B300 = '218,214,209';
const SCROLL_RANGE = 300; // px ที่ใช้ morph จาก rectangle → pill
const TARGET_PILL_W = 820; // ความกว้างสูงสุดของ pill (px)

const Navbar = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);
	const [bellOpen, setBellOpen] = useState(false);
	const [hamburgerOpen, setHamburgerOpen] = useState(false);
	const [p, setP] = useState(0); // scroll progress 0 → 1 (visual, lerped)
	const [vw, setVw] = useState(() => window.innerWidth);
	const menuRef = useRef<HTMLDivElement>(null);
	const bellRef = useRef<HTMLDivElement>(null);
	const headerRef = useRef<HTMLElement>(null);
	const targetP = useRef(0);  // ค่า target จาก scrollY
	const displayP = useRef(0); // ค่า visual ที่ lerp อยู่
	const rafId = useRef(0);

	const notifications = user
		? MOCK_NOTIFICATIONS.filter((n) => n.forRoles.includes(user.role as 'member' | 'admin'))
		: [];
	const unreadCount = notifications.filter((n) => !n.read).length;

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

	const handleLogout = () => {
		setMenuOpen(false);
		setHamburgerOpen(false);
		logout();
		navigate('/');
	};

	// ── Interpolated styles ───────────────────────────────────────────
	const isDesktop = vw >= 768;
	const endPx = isDesktop ? 32 : 16;               // header padding ที่ full scroll
	const endPillW = Math.min(TARGET_PILL_W, vw - 32); // pill width ที่ full scroll
	const pillMaxW = vw - (vw - endPillW) * p;       // linear interpolation

	const headerStyle: CSSProperties = {
		backgroundColor: `rgba(${B100},${1 - p})`,
		borderBottomColor: `rgba(${B300},${1 - p})`,
		paddingLeft: `${p * endPx}px`,
		paddingRight: `${p * endPx}px`,
		paddingTop: `${p * 10}px`,
	};

	const pillStyle: CSSProperties = {
		maxWidth: `${pillMaxW}px`,
		marginLeft: 'auto',
		marginRight: 'auto',
		borderRadius: `${p * 9999}px`,
		backgroundColor: `rgba(${B100},${p * 0.95})`,
		boxShadow: `0 4px 24px rgba(0,0,0,${p * 0.1}),0 1px 8px rgba(0,0,0,${p * 0.05})`,
		border: `1px solid rgba(${B300},${p * 0.5})`,
		backdropFilter: `blur(${p * 12}px)`,
		WebkitBackdropFilter: `blur(${p * 12}px)`,
	};

	const navPy = (isDesktop ? 16 : 12) - p * (isDesktop ? 8 : 4); // 16/12 → 8
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
					<Link to="/" className="font-medium text-brown-600" style={{ fontSize: 'clamp(1.75rem, 2vw, 1.5rem)' }}>DishCipes<span className="text-brand-green">.</span></Link>

					{/* ── Desktop nav ── */}
					<div className="hidden md:flex items-center gap-1">
						{user ? (
							<>
								{/* Bell / notifications */}
								<div className="relative" ref={bellRef}>
									<button
										onClick={() => { setBellOpen((prev) => !prev); setMenuOpen(false); }}
										className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-brown-200 active:scale-90 transition-all duration-150"
									>
										<img src={bellIcon} alt="Notifications" className="w-5 h-5" />
										{unreadCount > 0 && (
											<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
										)}
									</button>

									{bellOpen && (
										<div className="absolute right-0 top-full mt-2 w-80 bg-white border border-brown-200 rounded-2xl shadow-xl py-2 z-50 animate-slideDown">
											<p className="px-4 py-2 text-xs font-semibold text-brown-400 uppercase tracking-wide border-b border-brown-100">
												Notifications
											</p>
											{notifications.length === 0 ? (
												<p className="px-4 py-6 text-sm text-brown-300 text-center">No notifications</p>
											) : (
												<ul>
													{notifications.map((n) => (
														<li
															key={n.id}
															className={`flex items-start gap-3 px-4 py-3 hover:bg-brown-50 transition-colors duration-150 ${!n.read ? 'bg-brown-50/60' : ''}`}
														>
															<div className="w-10 h-10 rounded-full overflow-hidden bg-brown-200 shrink-0 mt-0.5">
																<img src={n.actorAvatar} alt={n.actorName} className="w-full h-full object-cover" />
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-sm text-brown-600 leading-snug">
																	<span className="font-semibold">{n.actorName}</span>{' '}
																	{n.action}
																</p>
																<p className="text-xs text-brown-400 mt-1">{n.time}</p>
															</div>
															{!n.read && (
																<span className="w-2 h-2 bg-red-400 rounded-full shrink-0 mt-1.5" />
															)}
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
										className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-brown-200 active:scale-95 transition-all duration-150"
									>
										<div className="w-8 h-8 rounded-full overflow-hidden bg-brown-300 shrink-0">
											{user.avatar ? (
												<img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<svg className="w-4 h-4 text-brown-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
													</svg>
												</div>
											)}
										</div>
										<span className="text-sm font-medium text-brown-600">{user.name.split(' ')[0]}</span>
										<svg className="w-4 h-4 text-brown-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
										</svg>
									</button>

									{menuOpen && (
										<div className="absolute right-0 top-full mt-2 w-52 bg-white border border-brown-200 rounded-2xl shadow-lg py-2 z-50 animate-slideDown">
											<Link
												to="/profile"
												onClick={() => setMenuOpen(false)}
												className="flex items-center gap-2 px-4 py-2.5 text-sm text-brown-500 hover:bg-brown-100 hover:text-brown-600 transition-colors duration-150"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
												Profile
											</Link>
											<Link
												to="/profile/reset-password"
												onClick={() => setMenuOpen(false)}
												className="flex items-center gap-2 px-4 py-2.5 text-sm text-brown-500 hover:bg-brown-100 hover:text-brown-600 transition-colors duration-150"
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
													className="flex items-center gap-2 px-4 py-2.5 text-sm text-brown-500 hover:bg-brown-100 hover:text-brown-600 transition-colors duration-150"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
													</svg>
													Admin panel
												</Link>
											)}
											<hr className="my-1 border-brown-200" />
											<button
												onClick={handleLogout}
												className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-brown-500 hover:bg-brown-100 hover:text-brown-600 transition-colors duration-150"
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
									className="px-10 py-3 text-base font-medium text-brown-600 border border-brown-400 rounded-full hover:bg-brown-100 active:scale-95 transition-all duration-150"
								>
									Log in
								</Link>
								<Link
									to="/signup"
									className="px-10 py-3 text-base font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 active:scale-95 transition-all duration-150"
								>
									Sign up
								</Link>
							</>
						)}
					</div>

					{/* ── Mobile hamburger button ── */}
					<button
						className="flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-md hover:bg-brown-200 active:scale-90 transition-all duration-150 md:hidden"
						onClick={() => setHamburgerOpen((prev) => !prev)}
						aria-label="Menu"
					>
						<span className={`block w-5 h-0.5 bg-brown-600 rounded-full transition-all duration-300 ${hamburgerOpen ? 'rotate-45 translate-y-2' : ''}`} />
						<span className={`block w-5 h-0.5 bg-brown-600 rounded-full transition-all duration-300 ${hamburgerOpen ? 'opacity-0 scale-x-0' : ''}`} />
						<span className={`block w-5 h-0.5 bg-brown-600 rounded-full transition-all duration-300 ${hamburgerOpen ? '-rotate-45 -translate-y-2' : ''}`} />
					</button>
				</nav>
			</div>

			{/* ── Mobile dropdown overlay ── */}
			{hamburgerOpen && (
				<div className="md:hidden absolute top-full left-0 right-0 z-50 bg-brown-100 border-b border-brown-300 px-4 pt-4 pb-5 animate-slideDown">
					{user ? (
						<>
							<div className="flex items-center gap-3 pb-4 mb-2 border-b border-brown-200">
								<div className="w-10 h-10 rounded-full overflow-hidden bg-brown-300 shrink-0">
									{user.avatar ? (
										<img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<svg className="w-5 h-5 text-brown-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
											</svg>
										</div>
									)}
								</div>
								<span className="text-sm font-semibold text-brown-600">{user.name}</span>
							</div>
							<div className="flex flex-col">
								<Link
									to="/profile"
									onClick={() => setHamburgerOpen(false)}
									className="flex items-center gap-3 px-2 py-3 text-sm text-brown-500 hover:text-brown-600 hover:bg-brown-200 rounded-lg transition-colors duration-150"
								>
									<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
									Profile
								</Link>
								<Link
									to="/profile/reset-password"
									onClick={() => setHamburgerOpen(false)}
									className="flex items-center gap-3 px-2 py-3 text-sm text-brown-500 hover:text-brown-600 hover:bg-brown-200 rounded-lg transition-colors duration-150"
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
										className="flex items-center gap-3 px-2 py-3 text-sm text-brown-500 hover:text-brown-600 hover:bg-brown-200 rounded-lg transition-colors duration-150"
									>
										<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
										</svg>
										Admin panel
									</Link>
								)}
								<hr className="my-2 border-brown-200" />
								<button
									onClick={handleLogout}
									className="flex items-center gap-3 w-full px-2 py-3 text-sm text-brown-500 hover:text-brown-600 hover:bg-brown-200 rounded-lg transition-colors duration-150"
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
								className="w-full py-3.5 text-center text-sm font-medium text-brown-600 border border-brown-400 rounded-full hover:bg-brown-200 active:scale-95 transition-all duration-150"
							>
								Log in
							</Link>
							<Link
								to="/signup"
								onClick={() => setHamburgerOpen(false)}
								className="w-full py-3.5 text-center text-sm font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 active:scale-95 transition-all duration-150"
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
