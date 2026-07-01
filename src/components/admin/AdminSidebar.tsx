// ── AdminSidebar ──────────────────────────────────────────────────────
// Sidebar navigation for the Admin panel — desktop fixed + mobile drawer
// แก้ไขได้: NAV_ITEMS list, logo text, sidebar width (w-60), active highlight style,
//           mobile drawer overlay, bottom links (website, log out)

import { useNavigate } from 'react-router-dom';
import notebookIcon from '../../assets/images/icons/notebook_light.svg';
import fileIcon from '../../assets/images/icons/File_light.svg';
import userIcon from '../../assets/images/icons/User_duotone.svg';
import bellIcon from '../../assets/images/icons/Bell_light.svg';
import outIcon from '../../assets/images/icons/Out_light.svg';
import signOutIcon from '../../assets/images/icons/Sign_out_squre_light.svg';

export type AdminView = 'articles' | 'categories' | 'users' | 'profile' | 'notifications' | 'reset-password';

type Props = {
	activeView: AdminView;
	onNavigate: (view: AdminView) => void;
	onLogout: () => void;
	mobileOpen?: boolean;
	onMobileClose?: () => void;
};

const NAV_ITEMS: { view: AdminView; label: string; icon: string }[] = [
	{ view: 'articles', label: 'Article management', icon: notebookIcon },
	{ view: 'categories', label: 'Category management', icon: fileIcon },
	{ view: 'users', label: 'User management', icon: userIcon },
	{ view: 'profile', label: 'Profile', icon: userIcon },
	{ view: 'notifications', label: 'Notification', icon: bellIcon },
	{ view: 'reset-password', label: 'Reset password', icon: bellIcon },
];

const AdminSidebar = ({ activeView, onNavigate, onLogout, mobileOpen = false, onMobileClose }: Props) => {
	const navigate = useNavigate();
	const handleNavigate = (view: AdminView) => {
		onNavigate(view);
		onMobileClose?.();
	};

	return (
		<>
			{/* ── Mobile backdrop ── */}
			{mobileOpen && (
				<div
					className="fixed inset-0 bg-black/40 z-40 md:hidden animate-fadeIn"
					onClick={onMobileClose}
				/>
			)}

			{/* ── Sidebar ── */}
			<aside className={`
				fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-brown-200 dark:bg-dark-surface border-r border-brown-300 dark:border-dark-border flex flex-col
				transition-transform duration-300 ease-in-out
				md:relative md:translate-x-0 md:w-60
				${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
			`}>
				<div className="px-6 pt-8 pb-6 flex items-center justify-between">
					<div>
						<p className="text-4xl font-medium text-stone-800 dark:text-brown-100 tracking-tight">DishCipes<span className="text-brand-green">.</span></p>
						<p className="text-lg font-medium text-orange-300 mt-0.5">Admin panel</p>
					</div>
					{/* Close button — mobile only */}
					<button
						onClick={onMobileClose}
						className="md:hidden w-8 h-8 flex items-center justify-center text-stone-400 dark:text-brown-300 hover:text-stone-600 dark:hover:text-brown-100 transition-colors duration-150"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<nav className="flex-1 px-3 flex flex-col gap-0.5">
					{NAV_ITEMS.map(({ view, label, icon }) => (
						<button
							key={view}
							onClick={() => handleNavigate(view)}
							className={`w-[calc(100%+1.5rem)] flex items-center gap-3 text-sm text-left active:scale-95 transition-all duration-150 ${
								activeView === view
									? '-mx-3 px-6 py-5 rounded-none bg-brown-300 dark:bg-dark-elevated text-stone-800 dark:text-brown-100 font-medium'
									: '-mx-3 px-6 py-4 rounded-none text-stone-500 dark:text-brown-300 hover:bg-brown-300/40 dark:hover:bg-dark-elevated hover:text-stone-700 dark:hover:text-brown-100'
							}`}
						>
							<img src={icon} alt="" className="w-5 h-5 shrink-0" />
							<span className="whitespace-nowrap">{label}</span>
						</button>
					))}
				</nav>

				<div className="px-3 pb-8 flex flex-col gap-0.5">
					<button
						onClick={() => navigate('/')}
						className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-500 dark:text-brown-300 hover:text-stone-700 dark:hover:text-brown-100 rounded-lg hover:bg-white/60 dark:hover:bg-dark-elevated transition-colors duration-150"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						Go back
					</button>
					<a
						href="/"
						className="flex items-center gap-3 px-3 py-2.5 text-sm text-stone-500 dark:text-brown-300 hover:text-stone-700 dark:hover:text-brown-100 rounded-lg hover:bg-white/60 dark:hover:bg-dark-elevated transition-colors duration-150"
					>
						<img src={outIcon} alt="" className="w-5 h-5" />
						DishCipes<span className="text-brand-green">.</span> website
					</a>
					<button
						onClick={onLogout}
						className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-500 dark:text-brown-300 hover:text-stone-700 dark:hover:text-brown-100 rounded-lg hover:bg-white/60 dark:hover:bg-dark-elevated transition-colors duration-150"
					>
						<img src={signOutIcon} alt="" className="w-5 h-5" />
						Log out
					</button>
				</div>
			</aside>
		</>
	);
};

export default AdminSidebar;
