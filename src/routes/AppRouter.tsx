import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import ArticleDetailPage from '../pages/ArticleDetailPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ProfilePage from '../pages/ProfilePage';
import ResetPasswordPage from '../pages/ResetPasswordPage';

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
			</Routes>
		</BrowserRouter>
	);
};

export default AppRouter;
