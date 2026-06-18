const HeroSection = () => {
	return (
		<section className="flex items-center gap-10 max-w-4xl mx-auto px-6 py-12">
			<div className="flex-1 text-right">
				<h1 className="text-4xl font-bold text-brown-600 leading-tight">
					Stay Informed,<br />Stay Inspired
				</h1>
				<p className="mt-4 text-sm text-brown-400 leading-relaxed">
					Discover a World of Knowledge at Your Fingertips.<br />
					Your Daily Dose of Inspiration and Information.
				</p>
			</div>

			<div className="w-44 aspect-3/4 shrink-0 bg-brown-300 rounded-lg overflow-hidden">
				<div className="w-full h-full bg-brown-200" />
			</div>

			<div className="flex-1">
				<p className="text-xs text-brown-400 mb-1">-Author</p>
				<h2 className="text-lg font-bold text-brown-600 mb-3">Teerapat N.</h2>
				<p className="text-sm text-brown-500 leading-relaxed mb-3">
					I am a pet enthusiast and freelance writer who specializes in animal behavior and care. With a deep love for cats, I enjoy sharing insights on feline companionship and wellness.
				</p>
				<p className="text-sm text-brown-500 leading-relaxed">
					When I'm not writing, I spends time volunteering at my local animal shelter, helping cats find loving homes.
				</p>
			</div>
		</section>
	);
};

export default HeroSection;
