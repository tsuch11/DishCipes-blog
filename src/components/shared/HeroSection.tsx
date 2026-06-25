// ── HeroSection ───────────────────────────────────────────────────────
// Hero banner with Lottie cooking animation and author bio
// แก้ไขได้: author name/bio text, Lottie animation file, scroll reveal threshold

import { Component, type ReactNode } from 'react';
import _Lottie from 'lottie-react';
import type { LottieComponentProps } from 'lottie-react';
import cookingAnimation from '../../assets/animations/cooking.json';
import useScrollReveal from '../../animations/useScrollReveal';

// Rolldown pre-bundles CJS as { default: Component, ... } — unwrap if needed
const Lottie = ((_Lottie as unknown as { default: React.FC<LottieComponentProps> }).default ?? _Lottie) as React.FC<LottieComponentProps>;

class LottieErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
	state = { error: false };
	static getDerivedStateFromError() { return { error: true }; }
	componentDidCatch(error: Error) { console.error('[LottieErrorBoundary]', error); }
	render() {
		if (this.state.error) return <div className="w-64 h-64 md:w-96 md:h-96 bg-brown-200 dark:bg-dark-elevated rounded-2xl" />;
		return this.props.children;
	}
}

const HeroSection = () => {
	const { ref: leftRef, visible: leftVisible } = useScrollReveal();
	const { ref: centerRef, visible: centerVisible } = useScrollReveal();
	const { ref: rightRef, visible: rightVisible } = useScrollReveal();

	return (
		<section className="flex flex-col items-center gap-6 max-w-7xl mx-auto px-4 py-8 md:flex-row md:items-center md:gap-10 md:px-10 md:py-12">
			{/* ── Left: headline ── */}
			<div ref={leftRef} className="w-full text-center order-2 md:flex-1 md:text-right md:order-1">
				<h1 className="text-4xl font-bold text-brown-600 dark:text-brown-100 leading-snug md:text-5xl">
					<span className={`block ${leftVisible ? 'animate-text-1' : 'opacity-0'}`}>Savor</span>
					<span className={`block ${leftVisible ? 'animate-text-2' : 'opacity-0'}`}>Every Bite,</span>
					<span className={`block ${leftVisible ? 'animate-text-3' : 'opacity-0'}`}>Discover</span>
					<span className={`block ${leftVisible ? 'animate-text-4' : 'opacity-0'}`}>Every Recipe</span>
				</h1>
				<p className={`mt-3 text-sm text-brown-400 dark:text-brown-300 leading-relaxed md:mt-4 ${leftVisible ? 'animate-text-5' : 'opacity-0'}`}>
					Discover a World of Flavors at Your Fingertips.<br />
					Your Daily Dose of Recipes and Culinary Inspiration.
				</p>
			</div>

			{/* ── Center: cooking animation ── */}
			<div
				ref={centerRef}
				className={`w-64 shrink-0 order-1 md:w-96 md:order-2 transition-all duration-700 delay-100 ${centerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
			>
				<LottieErrorBoundary>
					<Lottie animationData={cookingAnimation} loop={true} className="bg-transparent scale-150 -translate-y-10" />
				</LottieErrorBoundary>
			</div>

			{/* ── Right: author bio ── */}
			<div ref={rightRef} className="w-full text-center order-3 md:flex-1 md:text-left">
				<p className={`text-xs text-brown-400 dark:text-brown-300 mb-1 ${rightVisible ? 'animate-text-1' : 'opacity-0'}`}>-Author</p>
				<h2 className={`text-2xl font-bold text-brown-500 dark:text-brown-200 mb-3 ${rightVisible ? 'animate-text-2' : 'opacity-0'}`}>Teerapat N.</h2>
				<p className={`text-sm text-brown-400 dark:text-brown-300 leading-relaxed mb-3 ${rightVisible ? 'animate-text-3' : 'opacity-0'}`}>
					I am a food enthusiast and freelance writer who specializes in recipe development and home cooking. With a deep love for Thai cuisine, I enjoy sharing recipes, cooking tips, and stories behind every dish.
				</p>
				<p className={`text-sm text-brown-400 dark:text-brown-300 leading-relaxed ${rightVisible ? 'animate-text-4' : 'opacity-0'}`}>
					When I'm not writing, I spend my time exploring local markets and street food stalls, discovering new flavors to bring back to my kitchen.
				</p>
			</div>
		</section>
	);
};

export default HeroSection;
