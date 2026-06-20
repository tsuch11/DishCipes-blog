import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	const handleLogout = () => {
		setOpen(false);
		logout();
		navigate('/');
	};

	return (
		<header className="w-full bg-brown-100 border-b border-brown-300">
			<nav className="flex items-center justify-between max-w-7xl mx-auto px-4 py-3 md:px-10 md:py-4">
				<Link to="/" className="text-lg font-bold text-brown-600 md:text-xl">DishCipes</Link>

				<div className="flex items-center gap-2">
					{user ? (
						<div className="relative" ref={dropdownRef}>
							<button
								onClick={() => setOpen((prev) => !prev)}
								className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-brown-200 transition-colors duration-150"
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
								<span className="text-sm font-medium text-brown-600 hidden md:block">{user.name.split(' ')[0]}</span>
								<svg className="w-4 h-4 text-brown-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{open && (
								<div className="absolute right-0 top-full mt-2 w-48 bg-white border border-brown-200 rounded-2xl shadow-lg py-2 z-50">
									<Link
										to="/profile"
										onClick={() => setOpen(false)}
										className="flex items-center gap-2 px-4 py-2.5 text-sm text-brown-500 hover:bg-brown-100 hover:text-brown-600 transition-colors duration-150"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
										Profile
									</Link>
									<Link
										to="/profile/reset-password"
										onClick={() => setOpen(false)}
										className="flex items-center gap-2 px-4 py-2.5 text-sm text-brown-500 hover:bg-brown-100 hover:text-brown-600 transition-colors duration-150"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
										</svg>
										Reset password
									</Link>
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
