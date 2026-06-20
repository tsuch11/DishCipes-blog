import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
	const { user, logout } = useAuth();

	return (
		<header className="w-full bg-brown-100 border-b border-brown-300">
			<nav className="flex items-center justify-between max-w-7xl mx-auto px-4 py-3 md:px-10 md:py-4">
				<Link to="/" className="text-lg font-bold text-brown-600 md:text-xl">DishCipes</Link>

				<div className="flex items-center gap-2">
					{user ? (
						<>
							<span className="text-xs text-brown-500 md:text-sm">Hi, {user.name.split(' ')[0]}</span>
							<button
								onClick={logout}
								className="px-3 py-1.5 text-xs font-medium text-brown-600 border border-brown-400 rounded-full hover:bg-brown-100 transition-colors duration-150 md:px-5 md:text-sm"
							>
								Log out
							</button>
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
