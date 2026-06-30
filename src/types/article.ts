export type Article = {
	id: number;
	image: string;
	category: string;
	title: string;
	description: string;
	authorId?: string;
	authorName: string;
	authorUsername?: string;
	authorAvatar: string;
	date: string;
	readTime?: number;
	content?: string[];
	status?: 'published' | 'draft';
};
