// src/features/news/queries.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { fetchLatestNews, fetchJumpballNews, fetchRookieNews, fetchOtherNews } from "./api";

// 최신 기사 조회 Query
export const useLatestNewsQuery = () => {
	return useQuery({
		queryKey: queryKeys.news.latest(),
		queryFn: fetchLatestNews,
	});
};

// Jumpball 기사 조회 Query
export const useJumpballNewsQuery = (page: number, limit: number, enabled = true) => {
	return useQuery({
		queryKey: [...queryKeys.news.jumpball(), page, limit],
		queryFn: () => fetchJumpballNews(page, limit),
		enabled,
	});
};

// Rookie 기사 조회 Query
export const useRookieNewsQuery = (page: number, limit: number, enabled = true) => {
	return useQuery({
		queryKey: [...queryKeys.news.rookie(), page, limit],
		queryFn: () => fetchRookieNews(page, limit),
		enabled,
	});
};

// Other 기사 조회 Query
export const useOtherNewsQuery = (page: number, limit: number, enabled = true) => {
	return useQuery({
		queryKey: [...queryKeys.news.other(), page, limit],
		queryFn: () => fetchOtherNews(page, limit),
		enabled,
	});
};
