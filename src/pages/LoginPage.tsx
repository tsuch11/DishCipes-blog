import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const LoginPage = () => {
	const { login } = useAuth();
	const navigate = useNavigate();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		const result = await login(email, password);
		setLoading(false);

		if (result.success) {
			navigate('/');
		} else {
			setError(result.message);
		}
	};

	return (
		<div className="min-h-screen flex flex-col font-sans">
			<Navbar />

			<main className="flex-1 flex items-center justify-center px-4 py-12">
				<div className="w-full max-w-sm">
					<h1 className="text-2xl font-bold text-brown-600 mb-1">Welcome back</h1>
					<p className="text-sm text-brown-400 mb-8">Log in to your DishCipes account</p>

					{error && (
						<div className="flex items-start gap-2 px-4 py-3 mb-5 text-sm text-brand-red bg-red-50 border border-red-100 rounded-xl">
							<svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-brown-600">Email</label>
							<input
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full px-4 py-2.5 text-sm text-brown-600 bg-white border border-brown-300 rounded-xl outline-none placeholder:text-brown-300 focus:border-brown-500 transition-colors duration-150"
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-brown-600">Password</label>
							<input
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="w-full px-4 py-2.5 text-sm text-brown-600 bg-white border border-brown-300 rounded-xl outline-none placeholder:text-brown-300 focus:border-brown-500 transition-colors duration-150"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-2.5 text-sm font-medium text-white bg-brown-600 rounded-xl hover:bg-brown-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 mt-2"
						>
							{loading ? 'Logging in...' : 'Log in'}
						</button>
					</form>

					<p className="text-center text-xs text-brown-400 mt-6">
						Don't have an account?{' '}
						<Link to="/signup" className="font-medium text-brown-600 hover:underline">
							Sign up
						</Link>
					</p>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default LoginPage;
