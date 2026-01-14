// src/features/games/queries.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import {
	fetchGameSchedule,
	fetchScheduleDetails,
	fetchSchedulesByDateRange,
} from "./api";

// 경기 일정 조회 Query
export const useGameScheduleQuery = () => {
	return useQuery({
		queryKey: queryKeys.games.schedule(),
		queryFn: fetchGameSchedule,
	});
};

// 날짜 범위로 스케줄 조회 Query (캘린더용)
export const useSchedulesByDateRangeQuery = (
	start: string,
	end: string,
	enabled: boolean = true
) => {
	return useQuery({
		queryKey: queryKeys.games.schedulesByDateRange(start),
		queryFn: () => fetchSchedulesByDateRange(start),
		enabled: enabled && !!start,
		staleTime: 1000 * 60 * 5, // 5분간 캐시
		gcTime: 1000 * 60 * 30, // 30분간 유지
	});
};

// 스케줄 상세 정보 조회 Query
export const useScheduleDetailsQuery = (
	scheduleId: string | null,
	enabled: boolean = true
) => {
	return useQuery({
		queryKey: queryKeys.games.detail(scheduleId || ""),
		queryFn: () => fetchScheduleDetails(scheduleId!),
		enabled: enabled && !!scheduleId,
		// gameId 등 "현재 상태"가 중요해서 모달 열 때마다 최신 값을 받도록 함
		staleTime: 0,
		// 캐시를 30분간 유지
		gcTime: 1000 * 60 * 30,
		// 모달을 열 때마다 항상 refetch (캐시로 인해 gameId=null이 고정되는 현상 방지)
		refetchOnMount: "always",
		refetchOnWindowFocus: false,
	});
};
