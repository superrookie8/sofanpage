// src/features/events/api.ts
import clientAxiosService from "@/lib/client/http/axiosService";
import type { Event, EventDetails, PhotosResponse } from "./types";

// 이벤트 목록 조회
export const fetchEventList = async (): Promise<Event[]> => {
	const response = await fetch("/api/events", {
		method: "GET",
		cache: "no-store",
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || "이벤트 목록 조회 실패");
	}

	const data = await response.json();

	// data.events가 배열이면 data.events를 반환, data 자체가 배열이면 data를 반환, 아니면 빈 배열 반환
	if (Array.isArray(data.events)) {
		return data.events;
	}
	if (Array.isArray(data)) {
		return data;
	}
	return [];
};

// 이벤트 상세 조회
export const fetchEventDetail = async (
	eventId: string
): Promise<EventDetails> => {
	const response = await fetch(`/api/events/${eventId}`, {
		method: "GET",
		cache: "no-store",
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		if (response.status === 404) {
			throw new Error("이벤트 상세 정보를 찾을 수 없습니다");
		}
		throw new Error(errorData.message || "이벤트 상세 조회 실패");
	}

	const data = await response.json();
	return data;
};

// 이벤트 사진 조회
export const fetchEventPhotos = async (
	eventId: string,
	page: number = 1
): Promise<PhotosResponse> => {
	const response = await fetch(`/api/events/${eventId}/photos?page=${page}`, {
		method: "GET",
		cache: "no-store",
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || "이벤트 사진 조회 실패");
	}
	const data: PhotosResponse = await response.json();

	return data;
};
