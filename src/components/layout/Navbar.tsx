const Navbar = () => {
	return (
		<header className="w-full bg-white">
			<nav className="flex items-center justify-between max-w-4xl mx-auto px-6 py-4">
				<a href="/" className="text-xl font-bold text-brown-600">DishCipes</a>
				<div className="flex items-center gap-2">
					<button className="px-5 py-1.5 text-sm font-medium text-brown-600 border border-brown-300 rounded-full hover:bg-brown-100 transition-colors duration-150">
						Log in
					</button>
					<button className="px-5 py-1.5 text-sm font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 transition-colors duration-150">
						Sign up
					</button>
				</div>
			</nav>
		</header>
	);
};

export default Navbar;
