import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/shared/HeroSection';
import ArticlesSection from '../components/shared/ArticlesSection';

const LandingPage = () => {
	return (
		<div className="min-h-screen flex flex-col font-sans">
			<Navbar />
			<main className="flex-1">
				<HeroSection />
				<ArticlesSection />
			</main>
			<Footer />
		</div>
	);
};

export default LandingPage;
