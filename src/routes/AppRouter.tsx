import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import ArticleDetailPage from '../pages/ArticleDetailPage';

const AppRouter = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/article/:id" element={<ArticleDetailPage />} />
			</Routes>
		</BrowserRouter>
	);
};

export default AppRouter;
