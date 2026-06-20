import teerapatImg from '../../assets/images/icons/Teerapat.jpg';

const HeroSection = () => {
	return (
		<section className="flex flex-col items-center gap-6 max-w-7xl mx-auto px-4 py-8 md:flex-row md:items-center md:gap-10 md:px-10 md:py-12">
			<div className="w-full text-center order-2 md:flex-1 md:text-right md:order-1">
				<h1 className="text-4xl font-bold text-brown-600 leading-snug md:text-5xl">
					Savor<br />Every Bite,<br />Discover<br />Every Recipe
				</h1>
				<p className="mt-3 text-sm text-brown-400 leading-relaxed md:mt-4">
					Discover a World of Flavors at Your Fingertips.<br />
					Your Daily Dose of Recipes and Culinary Inspiration.
				</p>
			</div>

			<div className="w-64 shrink-0 rounded-2xl overflow-hidden order-1 md:w-96 md:order-2">
				<img src={teerapatImg} alt="Teerapat N." className="w-full h-full object-cover" />
			</div>

			<div className="w-full text-center order-3 md:flex-1 md:text-left">
				<p className="text-xs text-brown-400 mb-1">-Author</p>
				<h2 className="text-2xl font-bold text-brown-500 mb-3">Teerapat N.</h2>
				<p className="text-sm text-brown-400 leading-relaxed mb-3">
					I am a food enthusiast and freelance writer who specializes in recipe development and home cooking. With a deep love for Thai cuisine, I enjoy sharing recipes, cooking tips, and stories behind every dish.
				</p>
				<p className="text-sm text-brown-400 leading-relaxed">
					When I'm not writing, I spend my time exploring local markets and street food stalls, discovering new flavors to bring back to my kitchen.
				</p>
			</div>
		</section>
	);
};

export default HeroSection;
