// src/features/news/api.ts
import type { Article, NewsData, SectionData } from "./types";

// 백엔드는 출처를 "jumpball" / "rookie" 같은 영문 슬러그로 준다.
// 화면에는 매체명을 한글로 보여주므로 여기서 표시용 라벨로 정규화한다.
const SOURCE_LABELS: Record<string, string> = {
	jumpball: "점프볼",
	rookie: "루키",
};

export function sourceLabel(source: string | undefined, fallback = "뉴스") {
	const key = source?.trim().toLowerCase();
	if (!key) return fallback;
	return SOURCE_LABELS[key] ?? source!.trim();
}

function withSource(articles: Article[], fallback: string): Article[] {
	return articles.map((article) => ({
		...article,
		source: sourceLabel(article.source, fallback),
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
		return { main_article: { ...data, source: sourceLabel(data.source) } };
	}
	if (data.main_article) {
		return {
			...data,
			main_article: {
				...data.main_article,
				source: sourceLabel(data.main_article.source),
			},
		};
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
