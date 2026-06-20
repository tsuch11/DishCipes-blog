export type UserRole = 'guest' | 'member' | 'admin';

export type User = {
	id: string;
	name: string;
	username: string;
	email: string;
	role: UserRole;
	avatar?: string;
};
