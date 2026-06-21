import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import { articles } from '../data/articles';
import { MOCK_NOTIFICATIONS } from '../data/notifications';

const MOCK_USERS = [
	{ id: '1', name: 'Teerapat N.', username: 'teerapat', email: 'admin@dishcipes.com', role: 'admin' },
	{ id: '2', name: 'Member User', username: 'member', email: 'member@dishcipes.com', role: 'member' },
];

type Tab = 'overview' | 'articles' | 'members' | 'notifications';

const AdminPage = () => {
	const { user, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [tab, setTab] = useState<Tab>('overview');

	if (!isAuthenticated || !user) { navigate('/login'); return null; }
	if (user.role !== 'admin') { navigate('/'); return null; }

	const adminNotifications = MOCK_NOTIFICATIONS.filter((n) => n.forRoles.includes('admin'));
	const unread = adminNotifications.filter((n) => !n.read).length;

	const tabs: { key: Tab; label: string }[] = [
		{ key: 'overview', label: 'Overview' },
		{ key: 'articles', label: 'Articles' },
		{ key: 'members', label: 'Members' },
		{ key: 'notifications', label: `Notifications${unread > 0 ? ` (${unread})` : ''}` },
	];

	return (
		<div className="min-h-screen flex flex-col font-sans">
			<Navbar />

			<main className="flex-1">
				<div className="max-w-7xl mx-auto px-4 py-8 md:px-10 md:py-12">
					<h1 className="text-2xl font-bold text-brown-600 mb-8">Admin Panel</h1>

					<div className="flex gap-1 mb-8 border-b border-brown-200 overflow-x-auto">
						{tabs.map((t) => (
							<button
								key={t.key}
								onClick={() => setTab(t.key)}
								className={`px-5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-150 ${
									tab === t.key
										? 'border-brown-600 text-brown-600'
										: 'border-transparent text-brown-400 hover:text-brown-500'
								}`}
							>
								{t.label}
							</button>
						))}
					</div>

					{tab === 'overview' && (
						<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
							{[
								{ label: 'Total Articles', value: articles.length },
								{ label: 'Total Members', value: MOCK_USERS.length },
								{ label: 'Unread Notifications', value: unread },
								{ label: 'Total Comments', value: 3 },
							].map((stat) => (
								<div key={stat.label} className="bg-brown-200 rounded-2xl p-5">
									<p className="text-xs text-brown-400 mb-1">{stat.label}</p>
									<p className="text-3xl font-bold text-brown-600">{stat.value}</p>
								</div>
							))}
						</div>
					)}

					{tab === 'articles' && (
						<div className="bg-brown-200 rounded-2xl overflow-hidden">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-brown-300">
										<th className="text-left px-5 py-3 text-brown-400 font-medium">Title</th>
										<th className="text-left px-5 py-3 text-brown-400 font-medium hidden md:table-cell">Category</th>
										<th className="text-left px-5 py-3 text-brown-400 font-medium hidden md:table-cell">Date</th>
										<th className="text-left px-5 py-3 text-brown-400 font-medium">Read time</th>
									</tr>
								</thead>
								<tbody>
									{articles.map((a) => (
										<tr key={a.id} className="border-b border-brown-300/50 hover:bg-brown-300/20 transition-colors duration-100">
											<td className="px-5 py-3 text-brown-600 font-medium">{a.title}</td>
											<td className="px-5 py-3 text-brown-400 hidden md:table-cell">{a.category}</td>
											<td className="px-5 py-3 text-brown-400 hidden md:table-cell">{a.date}</td>
											<td className="px-5 py-3 text-brown-400">{a.readTime} min</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{tab === 'members' && (
						<div className="bg-brown-200 rounded-2xl overflow-hidden">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-brown-300">
										<th className="text-left px-5 py-3 text-brown-400 font-medium">Name</th>
										<th className="text-left px-5 py-3 text-brown-400 font-medium">Username</th>
										<th className="text-left px-5 py-3 text-brown-400 font-medium hidden md:table-cell">Email</th>
										<th className="text-left px-5 py-3 text-brown-400 font-medium">Role</th>
									</tr>
								</thead>
								<tbody>
									{MOCK_USERS.map((u) => (
										<tr key={u.id} className="border-b border-brown-300/50 hover:bg-brown-300/20 transition-colors duration-100">
											<td className="px-5 py-3 text-brown-600 font-medium">{u.name}</td>
											<td className="px-5 py-3 text-brown-400">@{u.username}</td>
											<td className="px-5 py-3 text-brown-400 hidden md:table-cell">{u.email}</td>
											<td className="px-5 py-3">
												<span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
													u.role === 'admin'
														? 'bg-brown-600 text-white'
														: 'bg-brown-300 text-brown-600'
												}`}>
													{u.role}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{tab === 'notifications' && (
						<div className="max-w-xl">
							<div className="bg-brown-200 rounded-2xl overflow-hidden">
								{adminNotifications.map((n, i) => (
									<div
										key={n.id}
										className={`flex items-start gap-3 px-5 py-4 ${!n.read ? 'bg-brown-300/30' : ''} ${i < adminNotifications.length - 1 ? 'border-b border-brown-300/50' : ''}`}
									>
										<div className="w-10 h-10 rounded-full overflow-hidden bg-brown-300 shrink-0 mt-0.5">
											<img src={n.actorAvatar} alt={n.actorName} className="w-full h-full object-cover" />
										</div>
										<div className="flex-1">
											<p className="text-sm text-brown-600">
												<span className="font-semibold">{n.actorName}</span>{' '}
												{n.action}
											</p>
											<p className="text-xs text-brown-400 mt-1">{n.time}</p>
										</div>
										{!n.read && <span className="w-2 h-2 bg-red-400 rounded-full shrink-0 mt-2" />}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
};

export default AdminPage;
