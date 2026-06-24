import { useNavigate } from 'react-router-dom';

const GoBackButton = () => {
	const navigate = useNavigate();
	return (
		<button
			onClick={() => navigate(-1)}
			className="inline-flex items-center gap-1.5 text-sm text-brown-400 dark:text-brown-300 hover:text-brown-600 dark:hover:text-brown-100 transition-colors duration-150"
		>
			<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
			</svg>
			Go back
		</button>
	);
};

export default GoBackButton;
