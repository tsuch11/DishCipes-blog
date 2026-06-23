// LandingPage — หน้าหลักของ food blog
// แก้ไขได้: scroll threshold ของ back-to-top (300px), back-to-top button position/style,
//           ลำดับ section (HeroSection → ArticlesSection), page background color

import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/shared/HeroSection';
import ArticlesSection from '../components/shared/ArticlesSection';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
	const [showBackTop, setShowBackTop] = useState(false);

	useEffect(() => {
		const onScroll = () => setShowBackTop(window.scrollY > 300);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<div className="min-h-screen flex flex-col font-sans">
			<Navbar />
			<main className="flex-1 animate-fadeInUp">
				{/* ── Hero ── */}
				<HeroSection />
				{/* ── Articles ── */}
				<ArticlesSection />
			</main>
			<Footer />

			{/* ── Back to top ── */}
			{showBackTop && (
				<button
					onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
					className="fixed bottom-6 right-6 w-10 h-10 flex items-center justify-center bg-brown-500 text-white rounded-full shadow-md hover:bg-brown-600 active:scale-90 transition-all duration-200 z-40 animate-fadeIn"
					aria-label="Back to top"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
					</svg>
				</button>
			)}
		</div>
	);
};

export default LandingPage;
