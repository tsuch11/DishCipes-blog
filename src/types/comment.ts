// ── Comment Types ─────────────────────────────────────────────────────

export type Reply = {
	id: number;
	userId: string;
	name: string;
	username: string;
	date: string;
	avatar: string;
	text: string;
	likes: number;
	likedByMe: boolean;
};

export type Comment = {
	id: number;
	userId: string;
	name: string;
	username: string;
	date: string;
	avatar: string;
	text: string;
	likes: number;
	likedByMe: boolean;
	replies: Reply[];
};
