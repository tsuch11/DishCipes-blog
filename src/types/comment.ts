// ── Comment Types ─────────────────────────────────────────────────────

export type Reply = {
	id: number;
	name: string;
	username: string;
	date: string;
	avatar: string;
	text: string;
};

export type Comment = {
	id: number;
	name: string;
	username: string;
	date: string;
	avatar: string;
	text: string;
	likes: number;
	likedByMe: boolean;
	replies: Reply[];
};
