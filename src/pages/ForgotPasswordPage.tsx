// ── ForgotPasswordPage ───────────────────────────────────────────────
// Request password reset via email OTP (route: /forgot-password)

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthPageLayout from '../components/ui/AuthPageLayout';
import FormField from '../components/ui/FormField';
import inputCls from '../utils/inputCls';

const ForgotPasswordPage = () => {
	const { sendPasswordReset } = useAuth();
	const navigate = useNavigate();

	const [email, setEmail] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	// ── Handlers ─────────────────────────────────────────────────────
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
		setLoading(true);
		setError('');
		const result = await sendPasswordReset(email);
		setLoading(false);
		if (result.success) {
			navigate('/verify-reset', { state: { email } });
		} else {
			setError(result.message || 'Failed to send reset code. Please try again.');
		}
	};

	return (
		<AuthPageLayout>
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold text-brown-600 dark:text-brown-100">Forgot password?</h1>
				<p className="text-sm text-brown-400 dark:text-brown-300 mt-3">
					Enter your email and we'll send a 6-digit code to reset your password.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="flex flex-col gap-5">
				<FormField label="Email" error={error}>
					<input
						type="email"
						placeholder="Your email address"
						value={email}
						onChange={(e) => { setEmail(e.target.value); setError(''); }}
						required
						className={inputCls(!!error)}
					/>
				</FormField>

				<div className="flex justify-center mt-2">
					<button
						type="submit"
						disabled={loading}
						className="px-12 py-3 text-base font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
					>
						{loading ? 'Sending...' : 'Send reset code'}
					</button>
				</div>
			</form>

			<p className="text-center text-sm text-brown-400 dark:text-brown-300 mt-6">
				Remember your password?{' '}
				<Link to="/login" className="font-medium text-brown-600 dark:text-brown-100 hover:underline">
					Log in
				</Link>
			</p>
		</AuthPageLayout>
	);
};

export default ForgotPasswordPage;
