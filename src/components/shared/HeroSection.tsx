// HeroSection — banner หน้าแรก แสดง headline + author profile
// แก้ไขได้: headline text ("Savor Every Bite..."), subtext, author image, author name,
//           author bio paragraphs, layout order (mobile vs desktop), section padding

import teerapatImg from '../../assets/images/icons/Teerapat.jpg';
import useScrollReveal from '../../animations/useScrollReveal';

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

			{/* ── Center: author photo ── */}
			<div
				ref={centerRef}
				className={`w-64 shrink-0 rounded-2xl overflow-hidden order-1 md:w-96 md:order-2 transition-all duration-700 delay-100 ${centerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
			>
				<img src={teerapatImg} alt="Teerapat N." className="w-full h-full object-cover" />
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
