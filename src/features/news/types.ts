// src/features/news/types.ts
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

export interface NewsData {
	main_article?: Article;
}

export interface SectionData {
	articles: Article[];
	total?: number;
	totalPages?: number;
	hasNext?: boolean;
	hasPrevious?: boolean;
}
