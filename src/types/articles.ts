export interface Article {
	id: string;
	source?: string;
	title: string;
	url: string;
	summary: string;
	imageUrl: string;
	publishedAt: string;
	crawledAt?: string;
	score?: number;
	mainTarget?: boolean;
}
