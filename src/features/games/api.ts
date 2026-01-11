// src/features/games/api.ts
import type { GameSchedule, ScheduleDetailsResponse } from "./types";

// 경기 일정 조회
export const fetchGameSchedule = async (): Promise<GameSchedule[]> => {
	const response = await fetch("/api/games/schedule", {
		method: "GET",
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("경기 일정 조회 실패");
	}

	const data = await response.json();
	return data.schedules || [];
};

// 스케줄 상세 정보 조회
export const fetchScheduleDetails = async (
	scheduleId: string
): Promise<ScheduleDetailsResponse> => {
	const response = await fetch(`/api/schedules/${scheduleId}/details`, {
		method: "GET",
		cache: "no-store",
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		if (response.status === 404) {
			throw new Error("스케줄 상세 정보를 찾을 수 없습니다");
		}
		throw new Error(errorData.message || "스케줄 상세 정보 조회 실패");
	}

	const data: ScheduleDetailsResponse = await response.json();
	return data;
};
