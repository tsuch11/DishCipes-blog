import type { Notification } from '../types/notification';

import jacobAvatar from '../assets/images/icons/Jacob_lash.svg';

export const MOCK_NOTIFICATIONS: Notification[] = [
	{
		id: '1',
		actorName: 'Jacob Lash',
		actorAvatar: jacobAvatar,
		action: 'Commented on your article.',
		time: '4 hours ago',
		read: false,
		forRoles: ['admin'],
	},
	{
		id: '2',
		actorName: 'Teerapat N.',
		actorAvatar: '/src/assets/images/icons/Teerapat.jpg',
		action: 'Published new article.',
		time: '2 hours ago',
		read: false,
		forRoles: ['member'],
	},
	{
		id: '3',
		actorName: 'Jacob Lash',
		actorAvatar: jacobAvatar,
		action: 'Comment on the article you have commented on.',
		time: '12 September 2024 at 18:30',
		read: true,
		forRoles: ['member'],
	},
];
