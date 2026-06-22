import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MOCK_NOTIFICATIONS } from '../../data/notifications';
import bellIcon from '../../assets/images/icons/Bell_light.svg';

const Navbar = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);
	const [bellOpen, setBellOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const bellRef = useRef<HTMLDivElement>(null);

	const notifications = user
		? MOCK_NOTIFICATIONS.filter((n) => n.forRoles.includes(user.role as 'member' | 'admin'))
		: [];
	const unreadCount = notifications.filter((n) => !n.read).length;

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
			if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	const handleLogout = () => {
		setMenuOpen(false);
		logout();
		navigate('/');
	};

	return (
		<header className="w-full bg-brown-100 border-b border-brown-300">
			<nav className="flex items-center justify-between max-w-7xl mx-auto px-4 py-3 md:px-10 md:py-4">
				<Link to="/" className="text-lg font-bold text-brown-600 md:text-xl">DishCipes</Link>

				<div className="flex items-center gap-1">
					{user ? (
						<>
							<div className="relative" ref={bellRef}>
								<button
									onClick={() => { setBellOpen((prev) => !prev); setMenuOpen(false); }}
									className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-brown-200 transition-colors duration-150"
								>
									<img src={bellIcon} alt="Notifications" className="w-5 h-5" />
									{unreadCount > 0 && (
										<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
									)}
								</button>

								{bellOpen && (
									<div className="absolute right-0 top-full mt-2 w-80 bg-white border border-brown-200 rounded-2xl shadow-xl py-2 z-50">
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

							<div className="relative" ref={menuRef}>
								<button
									onClick={() => { setMenuOpen((prev) => !prev); setBellOpen(false); }}
									className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-brown-200 transition-colors duration-150"
								>
									<div className="w-12 h-12 rounded-full overflow-hidden bg-brown-300 shrink-0">
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
									<span className="text-sm font-medium text-brown-600 hidden md:block">{user.name.split(' ')[0]}</span>
									<svg className="w-4 h-4 text-brown-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
									</svg>
								</button>

								{menuOpen && (
									<div className="absolute right-0 top-full mt-2 w-52 bg-white border border-brown-200 rounded-2xl shadow-lg py-2 z-50">
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
								className="px-3 py-1.5 text-xs font-medium text-brown-600 border border-brown-400 rounded-full hover:bg-brown-100 transition-colors duration-150 md:px-5 md:text-sm"
							>
								Log in
							</Link>
							<Link
								to="/signup"
								className="px-3 py-1.5 text-xs font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 transition-colors duration-150 md:px-5 md:text-sm"
							>
								Sign up
							</Link>
						</>
					)}
				</div>
			</nav>
		</header>
	);
};

export default Navbar;
