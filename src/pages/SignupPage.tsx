import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import FormField from '../components/ui/FormField';
import inputCls from '../utils/inputCls';

const SignupPage = () => {
	const { register } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const returnPath: string = (location.state as { from?: string })?.from ?? '/';

	const [name, setName] = useState('');
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [success, setSuccess] = useState(false);

	const validate = () => {
		const errs: Record<string, string> = {};
		if (!name.trim()) errs.name = 'Name is required.';
		if (!username.trim()) errs.username = 'Username is required.';
		if (!email.includes('@')) errs.email = 'Please enter a valid email.';
		if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
		return errs;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const errs = validate();
		if (Object.keys(errs).length > 0) {
			setErrors(errs);
			return;
		}

		const result = await register({ name, username, email, password });
		if (!result.success) {
			setErrors({ email: 'Email is already taken. Please try another email.' });
			return;
		}

		setErrors({});
		setSuccess(true);
	};

	if (success) {
		return (
			<div className="min-h-screen flex flex-col font-sans dark:bg-dark-bg">
				<Navbar />
				<main className="flex-1 flex items-center justify-center px-4 py-12 animate-fadeInUp">
					<div className="w-full max-w-lg bg-brown-200 dark:bg-dark-surface rounded-2xl px-10 py-16 text-center">
						<div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-8">
							<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h2 className="text-3xl font-bold text-brown-600 dark:text-brown-100 mb-8">Registration success</h2>
						<button
							onClick={() => navigate(returnPath)}
							className="px-10 py-3 text-sm font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 active:scale-95 transition-all duration-150"
						>
							Continue
						</button>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col font-sans dark:bg-dark-bg">
			<Navbar />

			<main className="flex-1 flex items-center justify-center px-4 py-12 animate-fadeInUp">
				<div className="w-full max-w-lg bg-brown-200 dark:bg-dark-surface rounded-2xl px-10 py-12">
					<h1 className="text-4xl font-bold text-brown-600 dark:text-brown-100 text-center mb-8">Sign up</h1>

					<form onSubmit={handleSubmit} className="flex flex-col gap-5">
						<FormField label="Name" error={errors.name}>
							<input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls(!!errors.name)} />
						</FormField>

						<FormField label="Username" error={errors.username}>
							<input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls(!!errors.username)} />
						</FormField>

						<FormField label="Email" error={errors.email}>
							<input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls(!!errors.email)} />
						</FormField>

						<FormField label="Password" error={errors.password}>
							<input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls(!!errors.password)} />
						</FormField>

						<div className="flex justify-center mt-2">
							<button
								type="submit"
								className="px-12 py-3 text-base font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 active:scale-95 transition-all duration-150"
							>
								Sign up
							</button>
						</div>
					</form>

					<p className="text-center text-sm text-brown-400 dark:text-brown-300 mt-6">
						Already have an account?{' '}
						<Link to="/login" className="font-medium text-brown-600 dark:text-brown-100 hover:underline">
							Log in
						</Link>
					</p>
				</div>
			</main>
		</div>
	);
};

export default SignupPage;
