import { NavLink } from 'react-router-dom';
import type { User } from '../../types/user';

type ProfileSidebarProps = {
	user: User;
	section: string;
};

const ProfileSidebar = ({ user, section }: ProfileSidebarProps) => {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-full overflow-hidden bg-brown-300 shrink-0">
					{user.avatar ? (
						<img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<svg className="w-5 h-5 text-brown-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
					)}
				</div>
				<div className="flex items-center gap-2 text-brown-600">
					<span className="font-semibold">{user.name}</span>
					<span className="text-brown-300">|</span>
					<span className="font-bold">{section}</span>
				</div>
			</div>

			<nav className="flex flex-col gap-1">
				<NavLink
					to="/profile"
					end
					className={({ isActive }) =>
						`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${isActive ? 'text-brown-600 font-semibold' : 'text-brown-400 hover:text-brown-600'}`
					}
				>
					<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
					Profile
				</NavLink>
				<NavLink
					to="/profile/reset-password"
					className={({ isActive }) =>
						`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${isActive ? 'text-brown-600 font-semibold' : 'text-brown-400 hover:text-brown-600'}`
					}
				>
					<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
					Reset password
				</NavLink>
			</nav>
		</div>
	);
};

export default ProfileSidebar;
