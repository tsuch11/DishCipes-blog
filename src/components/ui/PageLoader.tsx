// ── PageLoader ────────────────────────────────────────────────────────
// Full-page loading state with Navbar and Footer

import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

const PageLoader = () => (
	<div className="min-h-screen flex flex-col font-sans dark:bg-dark-bg">
		<Navbar />
		<main className="flex-1 flex items-center justify-center">
			<p className="text-brown-400 dark:text-brown-300 text-sm">Loading...</p>
		</main>
		<Footer />
	</div>
);

export default PageLoader;
