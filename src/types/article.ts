export type Article = {
	id: number;
	image: string;
	category: string;
	title: string;
	description: string;
	authorName: string;
	authorAvatar: string;
	date: string;
	readTime?: number;
	content?: string[];
	status?: 'published' | 'draft';
};
