const Navbar = () => {
	return (
		<header className="w-full bg-white">
			<nav className="flex items-center justify-between max-w-4xl mx-auto px-4 py-3 md:px-6 md:py-4">
				<a href="/" className="text-lg font-bold text-brown-600 md:text-xl">DishCipes</a>
				<div className="flex items-center gap-2">
					<button className="px-3 py-1.5 text-xs font-medium text-brown-600 border border-brown-300 rounded-full hover:bg-brown-100 transition-colors duration-150 md:px-5 md:text-sm">
						Log in
					</button>
					<button className="px-3 py-1.5 text-xs font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 transition-colors duration-150 md:px-5 md:text-sm">
						Sign up
					</button>
				</div>
			</nav>
		</header>
	);
};

export default Navbar;
