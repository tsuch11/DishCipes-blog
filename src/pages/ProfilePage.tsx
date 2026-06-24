// ProfilePage — หน้าแก้ไขโปรไฟล์ผู้ใช้
// แก้ไขได้: form fields (name, username), avatar upload button style,
//           card background (bg-brown-200), save button style,
//           mobile sidebar position (top border), desktop sidebar width (w-52)

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import GoBackButton from '../components/ui/GoBackButton';
import FormField from '../components/ui/FormField';
import Toast from '../components/ui/Toast';

// profile
const ProfilePage = () => {
	const { user, updateProfile, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [name, setName] = useState(user?.name ?? '');
	const [username, setUsername] = useState(user?.username ?? '');
	const [avatar, setAvatar] = useState(user?.avatar ?? '');
	const [showToast, setShowToast] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!isAuthenticated || !user) navigate('/login');
	}, [isAuthenticated, user, navigate]);

	if (!isAuthenticated || !user) return null;

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setAvatar(URL.createObjectURL(file));
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		await updateProfile({ name, username, avatar });
		setShowToast(true);
		setTimeout(() => setShowToast(false), 3000);
	};

	return (
		<div className="min-h-screen flex flex-col font-sans dark:bg-dark-bg">
			<Navbar />

			{/* ── Mobile sidebar nav (top) ── */}
			<div className="md:hidden border-b border-brown-200 dark:border-dark-border">
				<div className="max-w-7xl mx-auto px-4">
					<ProfileSidebar />
				</div>
			</div>

			<main className="flex-1 animate-viewFade">
				<div className="max-w-7xl mx-auto px-4 pt-6 md:px-10">
					<GoBackButton />
				</div>
				<div className="max-w-7xl mx-auto px-4 py-6 md:px-10 md:py-12">
					{/* ── User header ── */}
					<div className="flex items-center gap-4 mb-6 md:mb-8">
						<div className="w-16 h-16 rounded-full overflow-hidden bg-brown-300 dark:bg-dark-elevated shrink-0">
							{user.avatar ? (
								<img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<svg className="w-7 h-7 text-brown-500 dark:text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
							)}
						</div>
						<div className="flex items-center gap-3 min-w-0">
							<span className="text-2xl font-semibold text-brown-400 dark:text-brown-300 truncate">{user.name}</span>
							<span className="text-brown-300 dark:text-dark-border text-lg shrink-0">|</span>
							<span className="text-2xl font-bold text-brown-700 dark:text-brown-100 shrink-0">Profile</span>
						</div>
					</div>

					<div className="flex flex-col gap-8 md:flex-row md:gap-16">
						{/* ── Desktop sidebar ── */}
						<aside className="hidden md:block shrink-0 w-52">
							<ProfileSidebar />
						</aside>

						{/* ── Profile form ── */}
						<div className="flex-1 max-w-xl">
							<div className="bg-brown-200 dark:bg-dark-surface rounded-2xl p-6 md:p-8">
								<form onSubmit={handleSave} className="flex flex-col gap-6">
									<div className="flex items-center gap-5 pb-5 border-b border-brown-300 dark:border-dark-border">
										<div className="w-24 h-24 rounded-full overflow-hidden bg-brown-300 dark:bg-dark-elevated shrink-0">
											{avatar ? (
												<img src={avatar} alt={name} className="w-full h-full object-cover" />
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<svg className="w-9 h-9 text-brown-500 dark:text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
													</svg>
												</div>
											)}
										</div>
										<div>
											<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
											<button
												type="button"
												onClick={() => fileRef.current?.click()}
												className="px-8 py-3 text-sm font-medium text-brown-600 dark:text-brown-100 bg-white dark:bg-dark-elevated border border-brown-400 dark:border-dark-border rounded-full hover:bg-brown-100 dark:hover:bg-dark-border active:scale-95 transition-all duration-150"
											>
												Upload profile picture
											</button>
										</div>
									</div>

									<FormField label="Name" labelCls="text-sm text-brown-400 dark:text-brown-300">
										<input
											type="text"
											value={name}
											onChange={(e) => setName(e.target.value)}
											className="w-full px-4 py-3 text-sm font-medium text-brown-500 dark:text-brown-100 bg-white dark:bg-dark-elevated border-2 border-transparent rounded-xl outline-none focus:ring-2 focus:ring-brown-300 dark:focus:ring-dark-border transition-all duration-150"
										/>
									</FormField>

									<FormField label="Username" labelCls="text-sm text-brown-400 dark:text-brown-300">
										<input
											type="text"
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											className="w-full px-4 py-3 text-sm font-medium text-brown-500 dark:text-brown-100 bg-white dark:bg-dark-elevated border-2 border-transparent rounded-xl outline-none focus:ring-2 focus:ring-brown-300 dark:focus:ring-dark-border transition-all duration-150"
										/>
									</FormField>

									<FormField label="Email" labelCls="text-sm text-brown-400 dark:text-brown-300">
										<p className="px-4 py-3 text-sm text-brown-400 dark:text-brown-300">{user.email}</p>
									</FormField>

									<div>
										<button
											type="submit"
											className="px-8 py-2.5 text-sm font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 active:scale-95 transition-all duration-150"
										>
											Save
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</main>

			{showToast && (
				<Toast
					title="Saved profile"
					message="Your profile has been successfully updated"
					variant="success"
					onClose={() => setShowToast(false)}
				/>
			)}
		</div>
	);
};

export default ProfilePage;
