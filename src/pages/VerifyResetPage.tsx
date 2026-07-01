// ── VerifyResetPage ──────────────────────────────────────────────────
// Password reset: verify OTP then set new password (route: /verify-reset)

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import AuthPageLayout from '../components/ui/AuthPageLayout';
import FormField from '../components/ui/FormField';
import inputCls from '../utils/inputCls';

const VerifyResetPage = () => {
	const { verifyPasswordReset, setNewPassword } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const email: string = (location.state as { email?: string })?.email ?? '';

	const [step, setStep] = useState<'otp' | 'password'>('otp');
	const [otp, setOtp] = useState(['', '', '', '', '', '']);
	const [otpError, setOtpError] = useState('');
	const [otpLoading, setOtpLoading] = useState(false);
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [pwError, setPwError] = useState('');
	const [pwLoading, setPwLoading] = useState(false);
	const [cooldown, setCooldown] = useState(0);
	const [resendStatus, setResendStatus] = useState<'idle' | 'sent' | 'error'>('idle');
	const inputs = useRef<(HTMLInputElement | null)[]>([]);

	useEffect(() => {
		if (step === 'otp') setTimeout(() => inputs.current[0]?.focus(), 0);
	}, [step]);

	useEffect(() => {
		if (cooldown <= 0) return;
		const t = setTimeout(() => setCooldown(c => c - 1), 1000);
		return () => clearTimeout(t);
	}, [cooldown]);

	// ── OTP handlers ─────────────────────────────────────────────────
	const handleVerifyOtp = useCallback(async (code: string) => {
		if (!email) return;
		setOtpLoading(true);
		setOtpError('');
		const result = await verifyPasswordReset(email, code);
		setOtpLoading(false);
		if (result.success) {
			setStep('password');
		} else {
			setOtpError('Invalid or expired code. Please try again.');
			setOtp(['', '', '', '', '', '']);
			setTimeout(() => inputs.current[0]?.focus(), 0);
		}
	}, [email, verifyPasswordReset]);

	const handleOtpChange = (i: number, val: string) => {
		if (!/^\d*$/.test(val)) return;
		const next = [...otp];
		next[i] = val.slice(-1);
		setOtp(next);
		if (val && i < 5) inputs.current[i + 1]?.focus();
		if (next.every(d => d !== '')) handleVerifyOtp(next.join(''));
	};

	const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
	};

	const handleOtpPaste = (e: React.ClipboardEvent) => {
		const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
		if (!text) return;
		e.preventDefault();
		const next = Array.from({ length: 6 }, (_, i) => text[i] ?? '');
		setOtp(next);
		inputs.current[Math.min(text.length, 5)]?.focus();
		if (text.length === 6) handleVerifyOtp(text);
	};

	const handleResend = async () => {
		if (cooldown > 0 || !email) return;
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/verify-reset`,
		});
		if (error) { setResendStatus('error'); return; }
		setResendStatus('sent');
		setCooldown(60);
	};

	// ── Password handler ──────────────────────────────────────────────
	const handleSetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (password.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
		if (password !== confirm) { setPwError('Passwords do not match.'); return; }
		setPwLoading(true);
		setPwError('');
		const result = await setNewPassword(password);
		setPwLoading(false);
		if (result.success) {
			navigate('/login', { state: { message: 'Password reset successfully. Please log in.' } });
		} else {
			setPwError(result.message || 'Failed to set new password. Please try again.');
		}
	};

	if (!email) {
		return (
			<AuthPageLayout cardCls="px-10 py-16 text-center">
				<p className="text-brown-500 dark:text-brown-300">
					Session expired.{' '}
					<Link to="/forgot-password" className="text-brown-600 dark:text-brown-100 hover:underline">
						Try again
					</Link>
				</p>
			</AuthPageLayout>
		);
	}

	// ── Step 1: OTP ───────────────────────────────────────────────────
	if (step === 'otp') {
		return (
			<AuthPageLayout>
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-brown-600 dark:text-brown-100">Enter reset code</h1>
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
							onChange={(e) => handleOtpChange(i, e.target.value)}
							onKeyDown={(e) => handleOtpKeyDown(i, e)}
							onPaste={handleOtpPaste}
							className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-white dark:bg-dark-surface text-brown-700 dark:text-brown-100 outline-none transition-colors duration-150 ${
								otpError
									? 'border-red-400 dark:border-red-500'
									: digit
										? 'border-brown-500 dark:border-brown-400'
										: 'border-brown-200 dark:border-dark-border focus:border-brown-400 dark:focus:border-brown-300'
							}`}
						/>
					))}
				</div>

				{otpError && <p className="text-center text-sm text-red-500 mb-4">{otpError}</p>}
				{otpLoading && <p className="text-center text-sm text-brown-400 dark:text-brown-300 mb-4">Verifying...</p>}

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
	}

	// ── Step 2: New Password ──────────────────────────────────────────
	return (
		<AuthPageLayout>
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold text-brown-600 dark:text-brown-100">Set new password</h1>
				<p className="text-sm text-brown-400 dark:text-brown-300 mt-3">
					Create a new password for your account
				</p>
			</div>

			<form onSubmit={handleSetPassword} className="flex flex-col gap-5">
				<FormField label="New password" error={pwError}>
					<input
						type="password"
						placeholder="At least 8 characters"
						value={password}
						onChange={(e) => { setPassword(e.target.value); setPwError(''); }}
						required
						className={inputCls(!!pwError)}
					/>
				</FormField>

				<FormField label="Confirm password">
					<input
						type="password"
						placeholder="Confirm new password"
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)}
						required
						className={inputCls(!!pwError)}
					/>
				</FormField>

				{pwError && <p className="text-sm text-red-500 -mt-2">{pwError}</p>}

				<div className="flex justify-center mt-2">
					<button
						type="submit"
						disabled={pwLoading}
						className="px-12 py-3 text-base font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
					>
						{pwLoading ? 'Saving...' : 'Set password'}
					</button>
				</div>
			</form>
		</AuthPageLayout>
	);
};

export default VerifyResetPage;
