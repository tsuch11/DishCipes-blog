import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

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
				<div className="w-full max-w-lg bg-brown-200 rounded-2xl px-10 py-12">
					<h1 className="text-4xl font-bold text-brown-600 text-center mb-8">Log in</h1>

					<form onSubmit={handleSubmit} className="flex flex-col gap-5">
						<div className="flex flex-col gap-1.5">
							<label className="text-sm text-brown-500">Email</label>
							<input
								type="email"
								placeholder="Email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className={`w-full px-4 py-3 text-sm text-brown-600 bg-white border-2 rounded-xl outline-none placeholder:text-brown-300 transition-all duration-150 ${error ? 'border-red-400' : 'border-transparent focus:ring-2 focus:ring-brown-300'}`}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="text-sm text-brown-500">Password</label>
							<input
								type="password"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className={`w-full px-4 py-3 text-sm text-brown-600 bg-white border-2 rounded-xl outline-none placeholder:text-brown-300 transition-all duration-150 ${error ? 'border-red-400' : 'border-transparent focus:ring-2 focus:ring-brown-300'}`}
							/>
						</div>

						<div className="flex justify-center mt-2">
							<button
								type="submit"
								disabled={loading}
								className="px-12 py-3 text-base font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
							>
								{loading ? 'Logging in...' : 'Log in'}
							</button>
						</div>
					</form>

					<p className="text-center text-sm text-brown-400 mt-6">
						Don't have any account?{' '}
						<Link to="/signup" className="font-medium text-brown-600 hover:underline">
							Sign up
						</Link>
					</p>
				</div>
			</main>

			{error && (
				<div className="fixed bottom-6 right-6 flex items-start gap-3 bg-[#E8545A] text-white px-5 py-4 rounded-2xl shadow-lg z-50">
					<div className="flex-1">
						<p className="text-sm font-semibold whitespace-nowrap">Your password is incorrect or this email doesn't exist</p>
						<p className="text-xs mt-0.5 opacity-90">Please try another password or email</p>
					</div>
					<button onClick={() => setError('')} className="shrink-0 mt-0.5 hover:opacity-70 transition-opacity duration-150">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			)}
		</div>
	);
};

export default LoginPage;
