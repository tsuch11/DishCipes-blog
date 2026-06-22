import notebookIcon from '../../assets/images/icons/notebook_light.svg';
import fileIcon from '../../assets/images/icons/File_light.svg';
import userIcon from '../../assets/images/icons/User_duotone.svg';
import bellIcon from '../../assets/images/icons/Bell_light.svg';
import outIcon from '../../assets/images/icons/Out_light.svg';
import signOutIcon from '../../assets/images/icons/Sign_out_squre_light.svg';

export type AdminView = 'articles' | 'categories' | 'profile' | 'notifications' | 'reset-password';

type Props = {
	activeView: AdminView;
	onNavigate: (view: AdminView) => void;
	onLogout: () => void;
};

const NAV_ITEMS: { view: AdminView; label: string; icon: string }[] = [
	{ view: 'articles', label: 'Article management', icon: notebookIcon },
	{ view: 'categories', label: 'Category management', icon: fileIcon },
	{ view: 'profile', label: 'Profile', icon: userIcon },
	{ view: 'notifications', label: 'Notification', icon: bellIcon },
	{ view: 'reset-password', label: 'Reset password', icon: bellIcon },
];

const AdminSidebar = ({ activeView, onNavigate, onLogout }: Props) => {
	return (
		<aside className="fixed top-0 left-0 h-full w-56 bg-stone-100 border-r border-stone-200 flex flex-col z-40">
			<div className="px-6 pt-8 pb-6">
				<p className="text-2xl font-bold text-stone-800 tracking-tight">hh.</p>
				<p className="text-sm font-medium text-brown-500 mt-0.5">Admin panel</p>
			</div>

			<nav className="flex-1 px-3 flex flex-col gap-0.5">
				{NAV_ITEMS.map(({ view, label, icon }) => (
					<button
						key={view}
						onClick={() => onNavigate(view)}
						className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors duration-150 ${
							activeView === view
								? 'bg-white text-stone-800 font-medium shadow-sm'
								: 'text-stone-500 hover:bg-white/60 hover:text-stone-700'
						}`}
					>
						<img src={icon} alt="" className="w-5 h-5 shrink-0" />
						{label}
					</button>
				))}
			</nav>

			<div className="px-3 pb-8 flex flex-col gap-0.5">
				<a
					href="/"
					className="flex items-center gap-3 px-3 py-2.5 text-sm text-stone-500 hover:text-stone-700 rounded-lg hover:bg-white/60 transition-colors duration-150"
				>
					<img src={outIcon} alt="" className="w-5 h-5" />
					hh. website
				</a>
				<button
					onClick={onLogout}
					className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-500 hover:text-stone-700 rounded-lg hover:bg-white/60 transition-colors duration-150"
				>
					<img src={signOutIcon} alt="" className="w-5 h-5" />
					Log out
				</button>
			</div>
		</aside>
	);
};

export default AdminSidebar;
