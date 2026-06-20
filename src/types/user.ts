export type UserRole = 'guest' | 'member' | 'admin';

export type User = {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	avatar?: string;
};
