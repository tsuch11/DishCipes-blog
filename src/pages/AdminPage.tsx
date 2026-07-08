// ── AdminPage ─────────────────────────────────────────────────────────
// Admin panel (route: /admin) — no Navbar, uses AdminSidebar instead
// แก้ไขได้: views (articles, categories, notifications, profile, reset-password), toast messages

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import type { AdminView } from '../components/admin/AdminSidebar';
import AdminArticles from '../components/admin/AdminArticles';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers';
import AdminCategories from '../components/admin/AdminCategories';
import AdminProfile from '../components/admin/AdminProfile';
import AdminNotifications from '../components/admin/AdminNotifications';
import AdminResetPassword from '../components/admin/AdminResetPassword';
import Toast from '../components/ui/Toast';

// ── Component ─────────────────────────────────────────────────────────
const AdminPage = () => {
	const { user, isAuthenticated, logout, updateProfile, resetPassword } = useAuth();
	const navigate = useNavigate();

	// ── State ─────────────────────────────────────────────────────────
	const [view, setView] = useState<AdminView>('articles');
	const [articleSubview, setArticleSubview] = useState<'list' | 'create' | 'edit'>('list');
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const [toast, setToast] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' });

	// ── Hooks ─────────────────────────────────────────────────────────
	useEffect(() => {
		if (!isAuthenticated || !user || user.role !== 'admin') {
			navigate('/admin/login');
		}
	}, [isAuthenticated, user, navigate]);

	if (!isAuthenticated || !user || user.role !== 'admin') return null;

	// ── Handlers ─────────────────────────────────────────────────────
	const showToast = (title: string, message: string) => {
		setToast({ show: true, title, message });
		setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
	};

	const handleNavigate = (v: AdminView) => {
		setView(v);
		if (v === 'articles') setArticleSubview('list');
	};

	const handleLogout = () => { logout(); navigate('/'); };

	// ── Render ────────────────────────────────────────────────────────
	return (
		<div className="h-screen bg-brown-100 dark:bg-dark-bg font-sans flex overflow-hidden">
			<AdminSidebar
				activeView={view}
				onNavigate={handleNavigate}
				onLogout={handleLogout}
				mobileOpen={mobileSidebarOpen}
				onMobileClose={() => setMobileSidebarOpen(false)}
			/>

			<main className="flex-1 overflow-y-auto">
				{/* ── Mobile topbar ── */}
				<div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-brown-300 dark:border-dark-border bg-brown-100 dark:bg-dark-bg sticky top-0 z-30">
					<button
						onClick={() => setMobileSidebarOpen(true)}
						className="w-9 h-9 flex flex-col justify-center items-center gap-1.5 rounded-lg hover:bg-brown-200 dark:hover:bg-dark-elevated active:scale-90 transition-all duration-150"
					>
						<span className="block w-5 h-0.5 bg-stone-600 dark:bg-brown-300 rounded-full" />
						<span className="block w-5 h-0.5 bg-stone-600 dark:bg-brown-300 rounded-full" />
						<span className="block w-5 h-0.5 bg-stone-600 dark:bg-brown-300 rounded-full" />
					</button>
					<p className="text-lg font-medium text-stone-800 dark:text-brown-100 tracking-tight">DishCipes<span className="text-brand-green">.</span></p>
				</div>

				<div key={`${view}-${articleSubview}`} className="animate-viewFade">
					{view === 'articles' && (
						<AdminArticles subview={articleSubview} onSubviewChange={setArticleSubview} showToast={showToast} />
					)}
					{view === 'analytics' && <AdminDashboard />}
					{view === 'users' && <AdminUsers currentUserId={user.id} />}
					{view === 'categories' && <AdminCategories />}
					{view === 'profile' && <AdminProfile user={user} updateProfile={updateProfile} showToast={showToast} />}
					{view === 'notifications' && <AdminNotifications />}
					{view === 'reset-password' && <AdminResetPassword resetPassword={resetPassword} showToast={showToast} />}
				</div>
			</main>

			{toast.show && (
				<Toast
					title={toast.title}
					message={toast.message}
					variant="success"
					onClose={() => setToast((prev) => ({ ...prev, show: false }))}
				/>
			)}
		</div>
	);
};

export default AdminPage;
