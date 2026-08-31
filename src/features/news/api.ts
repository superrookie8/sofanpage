// src/features/news/api.ts
import type { Article, NewsData, SectionData } from "./types";

// 백엔드 기사 응답에는 매체명(source)이 없다. 어느 엔드포인트에서 왔는지로
// 출처를 채워야 카드의 출처 칩과 필터가 의미를 갖는다.
function withSource(articles: Article[], source: string): Article[] {
	return articles.map((article) => ({
		...article,
		source: article.source?.trim() || source,
	}));
}

// 최신 기사 조회
export const fetchLatestNews = async (): Promise<NewsData> => {
	const res = await fetch("/api/news/latest");

	if (!res.ok) {
		throw new Error(`HTTP error! status: ${res.status}`);
	}

	const data = await res.json();
	// 백엔드가 단일 Article 객체를 반환하는 경우
	if (data.id || data.title) {
		return { main_article: data };
	}
	return data;
};

// Jumpball 기사 조회
export const fetchJumpballNews = async (
	page: number,
	limit: number
): Promise<SectionData> => {
	// 백엔드는 0부터 시작하므로 page - 1
	const res = await fetch(
		`/api/news/jumpball?page=${page - 1}&limit=${limit}`
	);

	if (!res.ok) {
		throw new Error(`HTTP error! status: ${res.status}`);
	}

	const data = await res.json();
	// 백엔드 응답 형식: { articles: [...], total: 1000, totalPages: 200, ... }
	if (data.articles && Array.isArray(data.articles)) {
		return {
			articles: withSource(data.articles, "점프볼"),
			total: data.total || 0,
			totalPages: data.totalPages || 0,
			hasNext: data.hasNext || false,
			hasPrevious: data.hasPrevious || false,
		};
	}
	return { articles: [] };
};

// Rookie 기사 조회
export const fetchRookieNews = async (
	page: number,
	limit: number
): Promise<SectionData> => {
	// 백엔드는 0부터 시작하므로 page - 1
	const res = await fetch(`/api/news/rookie?page=${page - 1}&limit=${limit}`);

	if (!res.ok) {
		throw new Error(`HTTP error! status: ${res.status}`);
	}

	const data = await res.json();
	// 백엔드 응답 형식: { articles: [...], total: 1000, totalPages: 200, ... }
	if (data.articles && Array.isArray(data.articles)) {
		return {
			articles: withSource(data.articles, "루키"),
			total: data.total || 0,
			totalPages: data.totalPages || 0,
			hasNext: data.hasNext || false,
			hasPrevious: data.hasPrevious || false,
		};
	}
	return { articles: [] };
};
