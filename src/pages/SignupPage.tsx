import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const SignupPage = () => {
	const navigate = useNavigate();

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [success, setSuccess] = useState(false);

	const validate = () => {
		const errs: Record<string, string> = {};
		if (!name.trim()) errs.name = 'Name is required.';
		if (!email.includes('@')) errs.email = 'Please enter a valid email.';
		if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
		if (password !== confirm) errs.confirm = 'Passwords do not match.';
		return errs;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const errs = validate();
		if (Object.keys(errs).length > 0) {
			setErrors(errs);
			return;
		}
		setErrors({});
		setSuccess(true);
	};

	if (success) {
		return (
			<div className="min-h-screen flex flex-col font-sans">
				<Navbar />
				<main className="flex-1 flex items-center justify-center px-4 py-12">
					<div className="w-full max-w-sm text-center">
						<div className="w-14 h-14 rounded-full bg-brand-green-light flex items-center justify-center mx-auto mb-4">
							<svg className="w-7 h-7 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h2 className="text-xl font-bold text-brown-600 mb-2">Registration success!</h2>
						<p className="text-sm text-brown-400 mb-6">Your account has been created. You can now log in.</p>
						<button
							onClick={() => navigate('/login')}
							className="px-8 py-2.5 text-sm font-medium text-white bg-brown-600 rounded-xl hover:bg-brown-500 transition-colors duration-150"
						>
							Continue to Log in
						</button>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col font-sans">
			<Navbar />

			<main className="flex-1 flex items-center justify-center px-4 py-12">
				<div className="w-full max-w-sm">
					<h1 className="text-2xl font-bold text-brown-600 mb-1">Create an account</h1>
					<p className="text-sm text-brown-400 mb-8">Join DishCipes and start exploring recipes</p>

					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-brown-600">Name</label>
							<input
								type="text"
								placeholder="Your name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full px-4 py-2.5 text-sm text-brown-600 bg-white border border-brown-300 rounded-xl outline-none placeholder:text-brown-300 focus:border-brown-500 transition-colors duration-150"
							/>
							{errors.name && <p className="text-xs text-brand-red">{errors.name}</p>}
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-brown-600">Email</label>
							<input
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-2.5 text-sm text-brown-600 bg-white border border-brown-300 rounded-xl outline-none placeholder:text-brown-300 focus:border-brown-500 transition-colors duration-150"
							/>
							{errors.email && <p className="text-xs text-brand-red">{errors.email}</p>}
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-brown-600">Password</label>
							<input
								type="password"
								placeholder="Min. 8 characters"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-4 py-2.5 text-sm text-brown-600 bg-white border border-brown-300 rounded-xl outline-none placeholder:text-brown-300 focus:border-brown-500 transition-colors duration-150"
							/>
							{errors.password && <p className="text-xs text-brand-red">{errors.password}</p>}
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-brown-600">Confirm password</label>
							<input
								type="password"
								placeholder="Re-enter your password"
								value={confirm}
								onChange={(e) => setConfirm(e.target.value)}
								className="w-full px-4 py-2.5 text-sm text-brown-600 bg-white border border-brown-300 rounded-xl outline-none placeholder:text-brown-300 focus:border-brown-500 transition-colors duration-150"
							/>
							{errors.confirm && <p className="text-xs text-brand-red">{errors.confirm}</p>}
						</div>

						<button
							type="submit"
							className="w-full py-2.5 text-sm font-medium text-white bg-brown-600 rounded-xl hover:bg-brown-500 transition-colors duration-150 mt-2"
						>
							Sign up
						</button>
					</form>

					<p className="text-center text-xs text-brown-400 mt-6">
						Already have an account?{' '}
						<Link to="/login" className="font-medium text-brown-600 hover:underline">
							Log in
						</Link>
					</p>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default SignupPage;
