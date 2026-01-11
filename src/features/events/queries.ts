// src/features/events/queries.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { fetchEventList, fetchEventDetail, fetchEventPhotos } from "./api";
import type { PhotosResponse } from "./types";

// 이벤트 목록 조회 Query
export const useEventListQuery = () => {
	return useQuery({
		queryKey: queryKeys.events.lists(),
		queryFn: fetchEventList,
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

// 이벤트 사진 조회 Query
export const useEventPhotosQuery = (
	eventId: string,
	page: number = 1,
	enabled = true
) => {
	return useQuery({
		queryKey: queryKeys.events.photos(eventId),
		queryFn: () => fetchEventPhotos(eventId, page),
		enabled: enabled && !!eventId,
	});
};
