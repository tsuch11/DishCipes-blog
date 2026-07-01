// ── VerifyEmailPage ──────────────────────────────────────────────────
// Email OTP verification after signup (route: /verify-email)

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import AuthPageLayout from '../components/ui/AuthPageLayout';
import { Link } from 'react-router-dom';

const VerifyEmailPage = () => {
	const { verifyEmail } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const email: string = (location.state as { email?: string })?.email ?? '';

	const [otp, setOtp] = useState(['', '', '', '', '', '']);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [cooldown, setCooldown] = useState(0);
	const [resendStatus, setResendStatus] = useState<'idle' | 'sent' | 'error'>('idle');
	const inputs = useRef<(HTMLInputElement | null)[]>([]);

	useEffect(() => {
		inputs.current[0]?.focus();
	}, []);

	useEffect(() => {
		if (cooldown <= 0) return;
		const t = setTimeout(() => setCooldown(c => c - 1), 1000);
		return () => clearTimeout(t);
	}, [cooldown]);

	// ── Handlers ─────────────────────────────────────────────────────
	const handleVerify = useCallback(async (code: string) => {
		if (!email) return;
		setLoading(true);
		setError('');
		const result = await verifyEmail(email, code);
		setLoading(false);
		if (result.success) {
			navigate('/');
		} else {
			setError('Invalid or expired code. Please try again.');
			setOtp(['', '', '', '', '', '']);
			setTimeout(() => inputs.current[0]?.focus(), 0);
		}
	}, [email, verifyEmail, navigate]);

	const handleChange = (i: number, val: string) => {
		if (!/^\d*$/.test(val)) return;
		const next = [...otp];
		next[i] = val.slice(-1);
		setOtp(next);
		if (val && i < 5) inputs.current[i + 1]?.focus();
		if (next.every(d => d !== '')) handleVerify(next.join(''));
	};

	const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
		if (!text) return;
		e.preventDefault();
		const next = Array.from({ length: 6 }, (_, i) => text[i] ?? '');
		setOtp(next);
		inputs.current[Math.min(text.length, 5)]?.focus();
		if (text.length === 6) handleVerify(text);
	};

	const handleResend = async () => {
		if (cooldown > 0 || !email) return;
		const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
		if (resendError) { setResendStatus('error'); return; }
		setResendStatus('sent');
		setCooldown(60);
	};

	if (!email) {
		return (
			<AuthPageLayout cardCls="px-10 py-16 text-center">
				<p className="text-brown-500 dark:text-brown-300">
					No email found. Please{' '}
					<Link to="/signup" className="text-brown-600 dark:text-brown-100 hover:underline">
						sign up again
					</Link>.
				</p>
			</AuthPageLayout>
		);
	}

	return (
		<AuthPageLayout>
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold text-brown-600 dark:text-brown-100">Check your email</h1>
				<p className="text-sm text-brown-400 dark:text-brown-300 mt-3">
					We sent a 6-digit code to{' '}
					<span className="font-medium text-brown-600 dark:text-brown-100">{email}</span>
				</p>
			</div>

			<div className="flex justify-center gap-2 mb-6">
				{otp.map((digit, i) => (
					<input
						key={i}
						ref={(el) => { inputs.current[i] = el; }}
						type="text"
						inputMode="numeric"
						maxLength={1}
						value={digit}
						onChange={(e) => handleChange(i, e.target.value)}
						onKeyDown={(e) => handleKeyDown(i, e)}
						onPaste={handlePaste}
						className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-white dark:bg-dark-surface text-brown-700 dark:text-brown-100 outline-none transition-colors duration-150 ${
							error
								? 'border-red-400 dark:border-red-500'
								: digit
									? 'border-brown-500 dark:border-brown-400'
									: 'border-brown-200 dark:border-dark-border focus:border-brown-400 dark:focus:border-brown-300'
						}`}
					/>
				))}
			</div>

			{error && <p className="text-center text-sm text-red-500 mb-4">{error}</p>}
			{loading && <p className="text-center text-sm text-brown-400 dark:text-brown-300 mb-4">Verifying...</p>}

			<div className="text-center">
				<p className="text-sm text-brown-400 dark:text-brown-300">
					Didn't receive the code?{' '}
					<button
						onClick={handleResend}
						disabled={cooldown > 0}
						className="font-medium text-brown-600 dark:text-brown-100 hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-default"
					>
						{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
					</button>
				</p>
				{resendStatus === 'sent' && <p className="text-sm text-green-500 mt-2">Code resent! Check your inbox.</p>}
				{resendStatus === 'error' && <p className="text-sm text-red-500 mt-2">Failed to resend. Please try again.</p>}
			</div>
		</AuthPageLayout>
	);
};

export default VerifyEmailPage;
