// ── AdminResetPassword ────────────────────────────────────────────────
// Password change form for admin panel

import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────
type Props = {
	resetPassword: (current: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
	showToast: (title: string, message: string) => void;
};

const inputCls = (err?: boolean) =>
	`w-full px-4 py-3 text-sm text-stone-700 dark:text-brown-100 bg-white dark:bg-dark-elevated border rounded-xl outline-none placeholder:text-stone-300 dark:placeholder:text-brown-400 transition-colors duration-150 ${err ? 'border-red-400' : 'border-stone-200 dark:border-dark-border focus:border-stone-400 dark:focus:border-dark-border'}`;

// ── Component ─────────────────────────────────────────────────────────
const AdminResetPassword = ({ resetPassword, showToast }: Props) => {
	const [current, setCurrent] = useState('');
	const [newPass, setNewPass] = useState('');
	const [confirm, setConfirm] = useState('');
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const errs: Record<string, string> = {};
		if (!current) errs.current = 'Current password is required.';
		if (newPass.length < 8) errs.new = 'Password must be at least 8 characters.';
		if (newPass !== confirm) errs.confirm = 'Passwords do not match.';
		if (Object.keys(errs).length > 0) { setErrors(errs); return; }
		setErrors({});
		const result = await resetPassword(current, newPass);
		if (result.success) {
			setCurrent(''); setNewPass(''); setConfirm('');
			showToast('Password updated', 'Your password has been successfully updated');
		} else {
			setErrors({ current: result.message });
		}
	};

	return (
		<div className="px-4 py-6 md:px-12 md:py-8">
			<h1 className="text-xl font-bold text-stone-800 dark:text-brown-100 mb-6">Reset password</h1>
			<hr className="border-stone-200 dark:border-dark-border mb-6" />
			<form onSubmit={handleSubmit} className="max-w-md flex flex-col gap-5">
				<div className="flex flex-col gap-1.5">
					<label className="text-sm text-stone-500 dark:text-brown-300">Current password</label>
					<input type="password" placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputCls(!!errors.current)} />
					{errors.current && <p className="text-xs text-red-500">{errors.current}</p>}
				</div>
				<div className="flex flex-col gap-1.5">
					<label className="text-sm text-stone-500 dark:text-brown-300">New password</label>
					<input type="password" placeholder="New password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className={inputCls(!!errors.new)} />
					{errors.new && <p className="text-xs text-red-500">{errors.new}</p>}
				</div>
				<div className="flex flex-col gap-1.5">
					<label className="text-sm text-stone-500 dark:text-brown-300">Confirm new password</label>
					<input type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls(!!errors.confirm)} />
					{errors.confirm && <p className="text-xs text-red-500">{errors.confirm}</p>}
				</div>
				<div>
					<button type="submit" className="px-8 py-2.5 text-sm font-medium text-white bg-stone-800 rounded-full hover:bg-stone-700 transition-colors duration-150">Reset password</button>
				</div>
			</form>
		</div>
	);
};

export default AdminResetPassword;
