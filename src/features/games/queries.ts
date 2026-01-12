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
		// 캐시된 데이터를 10분간 사용 (스케줄 정보는 자주 변경되지 않음)
		staleTime: 1000 * 60 * 10,
		// 캐시를 30분간 유지
		gcTime: 1000 * 60 * 30,
		// 백그라운드 refetch 비활성화 (모달이 열릴 때만 fetch)
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};
