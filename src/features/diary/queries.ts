// src/features/diary/queries.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import {
	checkDiaryByGameId,
	fetchAllDiaries,
	fetchPersonalDiaries,
	fetchDiaryById,
	fetchDiaryByGameId,
} from "./api";
import type { DiaryListFilter } from "./types";

// 전체 일지 목록 조회 Query
export const useDiaryListQuery = (
	filter?: DiaryListFilter,
	enabled = true
) => {
	return useQuery({
		queryKey: queryKeys.diary.list(filter),
		queryFn: () => fetchAllDiaries(filter),
		enabled,
	});
};

// 개인 일지 목록 조회 Query
export const usePersonalDiaryListQuery = (filter: DiaryListFilter) => {
	return useQuery({
		queryKey: queryKeys.diary.userDiaries(filter.nickname || ""),
		queryFn: () => fetchPersonalDiaries(filter),
		enabled: !!filter.nickname,
	});
};

// 일지 상세 조회 Query
export const useDiaryQuery = (diaryId: string, enabled = true) => {
	return useQuery({
		queryKey: queryKeys.diary.detail(diaryId),
		queryFn: () => fetchDiaryById(diaryId),
		enabled: enabled && !!diaryId,
	});
};

// gameId로 일지 존재 여부 확인 (DiaryCheckResponse)
export const useDiaryCheckByGameIdQuery = (
	gameId: string | null,
	enabled = true
) => {
	return useQuery({
		queryKey: queryKeys.diary.checkByGameId(gameId || ""),
		queryFn: () => checkDiaryByGameId(gameId!),
		enabled: enabled && !!gameId,
		staleTime: 1000 * 30,
		gcTime: 1000 * 60 * 10,
		refetchOnMount: "always",
		refetchOnWindowFocus: false,
	});
};

/** @deprecated useDiaryCheckByGameIdQuery 사용 권장 */
export const useDiaryByGameIdQuery = (gameId: string | null, enabled = true) => {
	return useQuery({
		queryKey: queryKeys.diary.byGameId(gameId || ""),
		queryFn: () => fetchDiaryByGameId(gameId!),
		enabled: enabled && !!gameId,
		staleTime: 1000 * 30,
		gcTime: 1000 * 60 * 10,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};
