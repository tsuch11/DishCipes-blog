import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLoginPage = () => {
	const { login, isAuthenticated, user } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isAuthenticated && user?.role === 'admin') {
			navigate('/admin');
		}
	}, [isAuthenticated, user, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		const result = await login(email, password);
		setLoading(false);
		if (result.success) {
			if (result.role === 'admin') {
				navigate('/admin');
			} else {
				setError('This account does not have admin access.');
			}
		} else {
			setError(result.message);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 font-sans">
			<div className="w-full max-w-md bg-stone-100 rounded-2xl px-10 py-12 shadow-sm">
				<p className="text-sm font-medium text-brown-500 text-center mb-1">Admin panel</p>
				<h1 className="text-3xl font-bold text-stone-800 text-center mb-8">Log in</h1>

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<div className="flex flex-col gap-1.5">
						<label className="text-sm text-stone-500">Email</label>
						<input
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className={`w-full px-4 py-3 text-sm text-stone-700 bg-white border rounded-xl outline-none placeholder:text-stone-300 transition-all duration-150 ${error ? 'border-red-400' : 'border-stone-200 focus:border-stone-400'}`}
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="text-sm text-stone-500">Password</label>
						<input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className={`w-full px-4 py-3 text-sm text-stone-700 bg-white border rounded-xl outline-none placeholder:text-stone-300 transition-all duration-150 ${error ? 'border-red-400' : 'border-stone-200 focus:border-stone-400'}`}
						/>
					</div>

					<div className="flex justify-center mt-2">
						<button
							type="submit"
							disabled={loading}
							className="px-12 py-3 text-sm font-medium text-white bg-stone-800 rounded-full hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
						>
							{loading ? 'Logging in...' : 'Log in'}
						</button>
					</div>
				</form>
			</div>

			{error && (
				<div className="fixed bottom-6 right-6 flex items-start gap-3 bg-[#E8545A] text-white px-5 py-4 rounded-2xl shadow-lg z-50 max-w-xs">
					<div className="flex-1">
						<p className="text-sm font-semibold">Your password is incorrect or this email doesn't exist</p>
						<p className="text-xs mt-0.5 opacity-90">Please try another password or email</p>
					</div>
					<button onClick={() => setError('')} className="shrink-0 mt-0.5 hover:opacity-70 transition-opacity duration-150 text-white">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			)}
		</div>
	);
};

export default AdminLoginPage;
