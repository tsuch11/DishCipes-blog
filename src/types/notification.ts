export type Notification = {
	id: string;
	actorName: string;
	actorAvatar: string;
	action: string;
	time: string;
	read: boolean;
	forRoles: ('member' | 'admin')[];
};
