// ── AuthModal ─────────────────────────────────────────────────────────
// Modal prompting unauthenticated users to sign up or log in

import { Link, useNavigate } from 'react-router-dom';

type Props = {
	from: string;
	onClose: () => void;
};

const AuthModal = ({ from, onClose }: Props) => {
	const navigate = useNavigate();
	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
			<div className="relative bg-white dark:bg-dark-surface rounded-2xl px-12 py-14 w-full max-w-lg text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
				<button
					onClick={onClose}
					className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-brown-400 dark:text-brown-300 hover:text-brown-600 dark:hover:text-brown-100 transition-colors duration-150"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
				<h2 className="text-4xl font-semibold text-brown-600 dark:text-brown-100 mb-8">Create an account to<br />continue</h2>
				<button
					onClick={() => { onClose(); navigate('/signup', { state: { from } }); }}
					className="px-12 py-3.5 text-base font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 transition-colors duration-150"
				>
					Create account
				</button>
				<p className="text-sm text-brown-400 dark:text-brown-300 mt-4">
					Already have an account?{' '}
					<Link to="/login" state={{ from }} onClick={onClose} className="font-medium text-brown-600 dark:text-brown-100 hover:underline">
						Log in
					</Link>
				</p>
			</div>
		</div>
	);
};

export default AuthModal;
