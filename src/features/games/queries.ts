// src/features/games/queries.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { fetchGameSchedule, fetchScheduleDetails } from "./api";

// 경기 일정 조회 Query
export const useGameScheduleQuery = () => {
	return useQuery({
		queryKey: queryKeys.games.schedule(),
		queryFn: fetchGameSchedule,
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
	});
};
