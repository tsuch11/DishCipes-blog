// ── AuthPageLayout ────────────────────────────────────────────────────
// Shared layout wrapper for auth pages (login, signup, reset password)
// แก้ไขได้: background gradient, card max-width, Navbar inclusion

import Navbar from '../layout/Navbar';

type AuthPageLayoutProps = {
	children: React.ReactNode;
	cardCls?: string;
};

const AuthPageLayout = ({ children, cardCls = 'px-10 py-12' }: AuthPageLayoutProps) => (
	<div className="min-h-screen flex flex-col font-sans dark:bg-dark-bg">
		<Navbar />
		<main className="flex-1 flex items-center justify-center px-4 py-12 animate-fadeInUp">
			<div className={`w-full max-w-lg bg-brown-200 dark:bg-dark-surface rounded-2xl ${cardCls}`}>
				{children}
			</div>
		</main>
	</div>
);

export default AuthPageLayout;
