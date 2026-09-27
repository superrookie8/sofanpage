// src/features/news/api.ts
import type { Article, NewsData, SectionData } from "./types";
import type { NewsSource } from "./pagination";

export async function fetchNewsPage(source: NewsSource, page: number, limit: number): Promise<SectionData> {
	const params = new URLSearchParams({ page: String(page - 1), limit: String(limit) });
	if (source !== "all") params.set("source", source);
	const response = await fetch(`/api/news?${params}`);
	if (!response.ok) throw new Error("기사를 불러오지 못했습니다.");
	const data = await response.json();
	if (!Array.isArray(data.articles) || !Number.isInteger(data.totalPages) || data.totalPages < 0) {
		throw new Error("기사 응답을 확인할 수 없습니다.");
	}
	return { ...data, articles: withSource(data.articles, "뉴스") };
}

// 백엔드는 출처를 "jumpball" / "rookie" 같은 영문 슬러그로 준다.
// 화면에는 매체명을 한글로 보여주므로 여기서 표시용 라벨로 정규화한다.
const SOURCE_LABELS: Record<string, string> = {
	jumpball: "점프볼",
	rookie: "루키",
	other: "그외",
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

// Other 기사 조회
export const fetchOtherNews = async (
	page: number,
	limit: number
): Promise<SectionData> => {
	// 백엔드는 0부터 시작하므로 page - 1
	const res = await fetch(`/api/news/other?page=${page - 1}&limit=${limit}`);

	if (!res.ok) {
		throw new Error(`HTTP error! status: ${res.status}`);
	}

	const data = await res.json();
	// 백엔드 응답 형식: { articles: [...], total: 1000, totalPages: 200, ... }
	if (data.articles && Array.isArray(data.articles)) {
		return {
			articles: withSource(data.articles, "그외"),
			total: data.total || 0,
			totalPages: data.totalPages || 0,
			hasNext: data.hasNext || false,
			hasPrevious: data.hasPrevious || false,
		};
	}
	return { articles: [] };
};
