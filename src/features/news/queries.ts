// src/features/news/queries.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { fetchLatestNews, fetchJumpballNews, fetchRookieNews } from "./api";

// 최신 기사 조회 Query
export const useLatestNewsQuery = () => {
	return useQuery({
		queryKey: queryKeys.news.latest(),
		queryFn: fetchLatestNews,
	});
};

// Jumpball 기사 조회 Query
export const useJumpballNewsQuery = (page: number, limit: number) => {
	return useQuery({
		queryKey: [...queryKeys.news.jumpball(), page, limit],
		queryFn: () => fetchJumpballNews(page, limit),
	});
};

// Rookie 기사 조회 Query
export const useRookieNewsQuery = (page: number, limit: number) => {
	return useQuery({
		queryKey: [...queryKeys.news.rookie(), page, limit],
		queryFn: () => fetchRookieNews(page, limit),
	});
};
