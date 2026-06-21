import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import Toast from '../components/ui/Toast';

const ProfilePage = () => {
	const { user, updateProfile, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	if (!isAuthenticated || !user) {
		navigate('/login');
		return null;
	}

	const [name, setName] = useState(user.name);
	const [username, setUsername] = useState(user.username);
	const [avatar, setAvatar] = useState(user.avatar ?? '');
	const [showToast, setShowToast] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = URL.createObjectURL(file);
		setAvatar(url);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		await updateProfile({ name, username, avatar });
		setShowToast(true);
		setTimeout(() => setShowToast(false), 3000);
	};

	return (
		<div className="min-h-screen flex flex-col font-sans">
			<Navbar />

			<main className="flex-1">
				<div className="max-w-7xl mx-auto px-4 py-8 md:pl-60 md:pr-10 md:py-12">
					<div className="flex items-center gap-4 mb-8">
						<div className="w-16 h-16 rounded-full overflow-hidden bg-brown-300 shrink-0">
							{user.avatar ? (
								<img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<svg className="w-7 h-7 text-brown-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
							)}
						</div>
						<div className="flex items-center gap-3 flex-nowrap whitespace-nowrap">
							<span className="text-2xl font-semibold text-brown-400">{user.name}</span>
							<span className="text-brown-300 text-lg">|</span>
							<span className="text-2xl font-bold text-brown-700">Profile</span>
						</div>
					</div>

					<div className="flex flex-col gap-8 md:flex-row md:gap-16">
						<aside className="shrink-0 md:w-52">
							<ProfileSidebar />
						</aside>

						<div className="flex-1 max-w-xl">
							<div className="bg-brown-200 rounded-2xl p-6 md:p-8">
								<form onSubmit={handleSave} className="flex flex-col gap-6">
									<div className="flex items-center gap-5 pb-5 border-b border-brown-300">
										<div className="w-30 h-30 rounded-full overflow-hidden bg-brown-300 shrink-0">
											{avatar ? (
												<img src={avatar} alt={name} className="w-full h-full object-cover" />
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<svg className="w-9 h-9 text-brown-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
													</svg>
												</div>
											)}
										</div>
										<div>
											<input
												ref={fileRef}
												type="file"
												accept="image/*"
												className="hidden"
												onChange={handleAvatarChange}
											/>
											<button
												type="button"
												onClick={() => fileRef.current?.click()}
												className="px-10 py-3 text-md font-medium text-brown-600 bg-white border border-brown-400 rounded-full hover:bg-brown-100 transition-colors duration-150"
											>
												Upload profile picture
											</button>
										</div>
									</div>

									<div className="flex flex-col gap-1.5">
										<label className="text-sm text-brown-400">Name</label>
										<input
											type="text"
											value={name}
											onChange={(e) => setName(e.target.value)}
											className="w-full px-4 py-3 text-md font-medium text-brown-500 bg-white border-2 border-transparent rounded-xl outline-none placeholder:text-brown-300 focus:ring-2 focus:ring-brown-300 transition-all duration-150"
										/>
									</div>

									<div className="flex flex-col gap-1.5">
										<label className="text-sm text-brown-400">Username</label>
										<input
											type="text"
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											className="w-full px-4 py-3 text-md font-medium text-brown-500 bg-white border-2 border-transparent rounded-xl outline-none placeholder:text-brown-300 focus:ring-2 focus:ring-brown-300 transition-all duration-150"
										/>
									</div>

									<div className="flex flex-col gap-1.5">
										<label className="text-sm text-brown-400">Email</label>
										<p className="px-4 py-3 text-md text-brown-400">{user.email}</p>
									</div>

									<div>
										<button
											type="submit"
											className="px-8 py-2.5 text-md font-medium text-white bg-brown-600 rounded-full hover:bg-brown-500 transition-colors duration-150"
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
