// ── AppRouter ─────────────────────────────────────────────────────────
// Client-side routing config with scroll-to-top and page fade transition
// แก้ไขได้: route paths, protected route logic, page transition animation

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import ArticleDetailPage from '../pages/ArticleDetailPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import VerifyResetPage from '../pages/VerifyResetPage';
import ProfilePage from '../pages/ProfilePage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import AdminPage from '../pages/AdminPage';
import AdminLoginPage from '../pages/AdminLoginPage';
import UserProfilePage from '../pages/UserProfilePage';

// pageFade ใช้แค่ opacity (ไม่มี transform) → ไม่สร้าง containing block ให้ fixed element
// overlay อยู่ใน keyed div เพื่อให้ z-index (z-40) เทียบกับ navbar (z-50) ในตัวเดียวกัน
const RoutesWithTransition = () => {
	const location = useLocation();
	const showFade = location.pathname === '/' || location.pathname.startsWith('/article/');

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [location.pathname]);

	return (
		<div key={location.pathname} className="animate-pageFade">
			{showFade && (
				<div
					className="fixed top-0 left-0 right-0 pointer-events-none z-40"
					
				/>
			)}
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/article/:id" element={<ArticleDetailPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/signup" element={<SignupPage />} />
				<Route path="/verify-email" element={<VerifyEmailPage />} />
				<Route path="/forgot-password" element={<ForgotPasswordPage />} />
				<Route path="/verify-reset" element={<VerifyResetPage />} />
				<Route path="/profile" element={<ProfilePage />} />
				<Route path="/profile/reset-password" element={<ResetPasswordPage />} />
				<Route path="/admin/login" element={<AdminLoginPage />} />
				<Route path="/admin" element={<AdminPage />} />
				<Route path="/user/:username" element={<UserProfilePage />} />
			</Routes>
		</div>
	);
};

const AppRouter = () => {
	return (
		<BrowserRouter>
			<RoutesWithTransition />
		</BrowserRouter>
	);
};

export default AppRouter;
