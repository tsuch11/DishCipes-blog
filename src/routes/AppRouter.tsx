import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import ArticleDetailPage from '../pages/ArticleDetailPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ProfilePage from '../pages/ProfilePage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import AdminPage from '../pages/AdminPage';
import AdminLoginPage from '../pages/AdminLoginPage';

const AppRouter = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/article/:id" element={<ArticleDetailPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/signup" element={<SignupPage />} />
				<Route path="/profile" element={<ProfilePage />} />
				<Route path="/profile/reset-password" element={<ResetPasswordPage />} />
				<Route path="/admin/login" element={<AdminLoginPage />} />
				<Route path="/admin" element={<AdminPage />} />
			</Routes>
		</BrowserRouter>
	);
};

export default AppRouter;
