// ── LoginPage ─────────────────────────────────────────────────────────
// Member login form with redirect support (route: /login)
// แก้ไขได้: heading text, subtitle, right-panel image, redirect path after login

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/ui/FormField';
import Toast from '../components/ui/Toast';
import inputCls from '../utils/inputCls';

// ── Component ──────────────────────────────────────────────────────────

const LoginPage = () => {

	// ── State ─────────────────────────────────────────────────────────────

	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const returnPath: string = (location.state as { from?: string })?.from ?? '/';

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	// ── Handlers ──────────────────────────────────────────────────────────

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		setError('');
		setLoading(true);
		const result = await login(email, password);
		setLoading(false);
		if (result.success) {
			navigate(returnPath);
		} else {
			setError(result.message);
		}
	};

	// ── Render ────────────────────────────────────────────────────────────

	return (
		<div className="min-h-screen flex flex-col bg-brown-100 dark:bg-dark-bg">
			<main className="flex flex-1 items-start justify-center px-4 pt-6 pb-8 lg:items-center lg:py-8">
				<div className="w-full lg:flex lg:flex-row lg:max-w-4xl lg:shadow-xl lg:rounded-2xl lg:overflow-hidden animate-fadeInUp">

				{/* ── Logo (mobile only) ── */}
				<img src="/images/images/icons/dishcipes_logo2.svg" alt="DishCipes" className="lg:hidden w-64 mx-auto mb-6 object-contain" />

				{/* ── Form panel (left) ── */}
				<div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-10 lg:bg-white lg:dark:bg-dark-surface">
					<div className="w-full max-w-sm">

						<div className="mb-8">
							<h1 className="text-3xl font-bold text-brown-600 dark:text-brown-100">Back to the kitchen 🍳</h1>
							<p className="text-sm text-brown-400 dark:text-brown-300 mt-2 leading-relaxed">
								Sign in to explore recipes, restaurant reviews, and kitchen tips.
							</p>
						</div>

						<form onSubmit={handleSubmit} className="flex flex-col gap-5">
							<FormField label="Email or Username">
								<input
									type="text"
									placeholder="Email or username"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className={inputCls(false)}
								/>
							</FormField>

							<FormField label="Password">
								<div className="flex flex-col gap-1">
									<div className="relative">
										<input
											type={showPassword ? 'text' : 'password'}
											placeholder="Your password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
											className={inputCls(false)}
										/>
										<button
											type="button"
											onClick={() => setShowPassword((prev) => !prev)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-400 hover:text-brown-600 dark:hover:text-brown-100 transition-colors duration-150"
											aria-label={showPassword ? 'Hide password' : 'Show password'}
										>
											{showPassword ? (
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
												</svg>
											) : (
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
												</svg>
											)}
										</button>
									</div>
									<div className="flex justify-end">
										<Link
											to="/forgot-password"
											className="text-xs text-brown-400 dark:text-brown-300 hover:text-brown-600 dark:hover:text-brown-100 hover:underline transition-colors duration-150"
										>
											Forgot password?
										</Link>
									</div>
								</div>
							</FormField>

							<button
								type="submit"
								disabled={loading}
								className="w-full py-3 text-base font-medium text-white bg-brown-600 rounded-xl hover:bg-brown-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 mt-1"
							>
								{loading ? 'Logging in...' : 'Log in'}
							</button>
						</form>

						<p className="text-center text-sm text-brown-400 dark:text-brown-300 mt-6">
							Don't have an account?{' '}
							<Link to="/signup" className="font-medium text-brown-600 dark:text-brown-100 hover:underline">
								Sign up
							</Link>
						</p>

					</div>
				</div>

				{/* ── Logo panel (right, lg+ only) ── */}
				<div className="hidden lg:flex flex-1 items-center justify-center p-6 bg-white">
					<div className="flex flex-1 self-stretch items-center justify-center bg-brown-100 rounded-2xl">
						<img
							src="/images/images/icons/dishcipes_logo2.svg"
							alt="DishCipes"
							className="w-full h-full object-contain scale-175"
						/>
					</div>
				</div>

				</div>
			</main>

			{error && (
				<Toast
					title="Login failed"
					message="Your password is incorrect or this account doesn't exist."
					variant="error"
					onClose={() => setError('')}
				/>
			)}
		</div>
	);
};

export default LoginPage;
