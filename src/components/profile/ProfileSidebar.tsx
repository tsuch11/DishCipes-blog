// ProfileSidebar — sidebar navigation สำหรับหน้า Profile และ Reset password
// แก้ไขได้: nav items (เพิ่ม/ลด link), icons, active highlight style,
//           mobile layout (flex-row), desktop layout (flex-col), gap ระหว่าง items

import { NavLink } from 'react-router-dom';
import userIcon from '../../assets/images/icons/User_duotone.svg';
import refreshIcon from '../../assets/images/icons/Refresh_light.svg';

// profile sidebar
const ProfileSidebar = () => {
	return (
		<nav className="flex flex-row gap-0 md:flex-col md:gap-0.5">
			<NavLink
				to="/profile"
				end
				className={({ isActive }) =>
					`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-all duration-150 active:scale-95 ${isActive ? 'text-brown-600 font-semibold' : 'text-brown-400 hover:text-brown-600'}`
				}
			>
				<img src={userIcon} alt="" className="w-4 h-4 shrink-0" />
				Profile
			</NavLink>
			<NavLink
				to="/profile/reset-password"
				className={({ isActive }) =>
					`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-all duration-150 active:scale-95 ${isActive ? 'text-brown-600 font-semibold' : 'text-brown-400 hover:text-brown-600'}`
				}
			>
				<img src={refreshIcon} alt="" className="w-4 h-4 shrink-0" />
				Reset password
			</NavLink>
		</nav>
	);
};

export default ProfileSidebar;
