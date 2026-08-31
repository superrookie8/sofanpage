// src/features/events/queries.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { fetchEventList, fetchEventDetail } from "./api";

// 이벤트 목록 조회 Query
export const useEventListQuery = () => {
	return useQuery({
		queryKey: queryKeys.events.lists(),
		queryFn: fetchEventList,
		// 관리자 순서 변경 후 새로고침/재진입 시 5분 전역 캐시를 재사용하지 않는다.
		staleTime: 0,
		refetchOnMount: "always",
	});
};

// 이벤트 상세 조회 Query
export const useEventDetailQuery = (eventId: string, enabled = true) => {
	return useQuery({
		queryKey: queryKeys.events.detail(eventId),
		queryFn: () => fetchEventDetail(eventId),
		enabled: enabled && !!eventId,
	});
};
