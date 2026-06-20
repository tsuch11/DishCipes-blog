import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import Toast from '../components/ui/Toast';
import ConfirmModal from '../components/ui/ConfirmModal';

const ResetPasswordPage = () => {
	const { user, resetPassword, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	if (!isAuthenticated || !user) {
		navigate('/login');
		return null;
	}

	const [current, setCurrent] = useState('');
	const [newPass, setNewPass] = useState('');
	const [confirm, setConfirm] = useState('');
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [showModal, setShowModal] = useState(false);
	const [toast, setToast] = useState<{ show: boolean; success: boolean; message: string }>({ show: false, success: true, message: '' });

	const validate = () => {
		const errs: Record<string, string> = {};
		if (!current) errs.current = 'Current password is required.';
		if (newPass.length < 8) errs.newPass = 'Password must be at least 8 characters.';
		if (newPass !== confirm) errs.confirm = 'Passwords do not match.';
		return errs;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const errs = validate();
		if (Object.keys(errs).length > 0) { setErrors(errs); return; }
		setErrors({});
		setShowModal(true);
	};

	const handleConfirmReset = async () => {
		setShowModal(false);
		const result = await resetPassword(current, newPass);
		if (result.success) {
			setCurrent('');
			setNewPass('');
			setConfirm('');
			setToast({ show: true, success: true, message: 'Your password has been successfully updated' });
		} else {
			setErrors({ current: result.message });
			setToast({ show: true, success: false, message: result.message });
		}
		setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
	};

	return (
		<div className="min-h-screen flex flex-col font-sans">
			<Navbar />

			<main className="flex-1">
				<div className="max-w-7xl mx-auto px-4 py-8 md:px-10 md:py-12">
					<div className="flex flex-col gap-8 md:flex-row md:gap-16">
						<aside className="shrink-0 md:w-52">
							<ProfileSidebar user={user} section="Reset password" />
						</aside>

						<div className="flex-1 max-w-xl">
							<div className="bg-brown-200 rounded-2xl p-6 md:p-8">
								<form onSubmit={handleSubmit} className="flex flex-col gap-5">
									<div className="flex flex-col gap-1.5">
										<label className="text-sm text-brown-500">Current password</label>
										<input
											type="password"
											placeholder="Current password"
											value={current}
											onChange={(e) => setCurrent(e.target.value)}
											className={`w-full px-4 py-3 text-sm text-brown-600 bg-white border-2 rounded-xl outline-none placeholder:text-brown-300 transition-all duration-150 ${errors.current ? 'border-red-400' : 'border-transparent focus:ring-2 focus:ring-brown-300'}`}
										/>
										{errors.current && <p className="text-xs text-red-500">{errors.current}</p>}
									</div>

									<div className="flex flex-col gap-1.5">
										<label className="text-sm text-brown-500">New password</label>
										<input
											type="password"
											placeholder="New password"
											value={newPass}
											onChange={(e) => setNewPass(e.target.value)}
											className={`w-full px-4 py-3 text-sm text-brown-600 bg-white border-2 rounded-xl outline-none placeholder:text-brown-300 transition-all duration-150 ${errors.newPass ? 'border-red-400' : 'border-transparent focus:ring-2 focus:ring-brown-300'}`}
										/>
										{errors.newPass && <p className="text-xs text-red-500">{errors.newPass}</p>}
									</div>

									<div className="flex flex-col gap-1.5">
										<label className="text-sm text-brown-500">Confirm new password</label>
										<input
											type="password"
											placeholder="Confirm new password"
											value={confirm}
											onChange={(e) => setConfirm(e.target.value)}
											className={`w-full px-4 py-3 text-sm text-brown-600 bg-white border-2 rounded-xl outline-none placeholder:text-brown-300 transition-all duration-150 ${errors.confirm ? 'border-red-400' : 'border-transparent focus:ring-2 focus:ring-brown-300'}`}
										/>
										{errors.confirm && <p className="text-xs text-red-500">{errors.confirm}</p>}
									</div>

									<div className="mt-1">
										<button
											type="submit"
											className="px-8 py-2.5 text-sm font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 transition-colors duration-150"
										>
											Reset password
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</main>

			{showModal && (
				<ConfirmModal
					title="Reset password"
					message="Do you want to reset your password?"
					confirmLabel="Reset"
					cancelLabel="Cancel"
					onConfirm={handleConfirmReset}
					onCancel={() => setShowModal(false)}
				/>
			)}

			{toast.show && (
				<Toast
					title={toast.success ? 'Password updated' : 'Error'}
					message={toast.message}
					variant={toast.success ? 'success' : 'error'}
					onClose={() => setToast((prev) => ({ ...prev, show: false }))}
				/>
			)}
		</div>
	);
};

export default ResetPasswordPage;
