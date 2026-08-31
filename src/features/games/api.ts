// src/features/games/api.ts
import type {
	GameSchedule,
	ScheduleDetailsResponse,
	ScheduleResponse,
} from "./types";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function toScheduleDateTime(
	value: string,
	boundary: "start" | "end"
): string {
	if (!DATE_ONLY.test(value)) return value;
	return `${value}T${boundary === "start" ? "00:00:00" : "23:59:59"}`;
}

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

// 날짜 범위로 스케줄 조회 (캘린더용)
export const fetchSchedulesByDateRange = async (
	start: string,
	end?: string
): Promise<ScheduleResponse[]> => {
	const params = new URLSearchParams({
		start: toScheduleDateTime(start, "start"),
	});
	if (end) params.set("end", toScheduleDateTime(end, "end"));
	const response = await fetch(`/api/schedules?${params.toString()}`, {
		method: "GET",
		cache: "no-store",
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || "스케줄 조회 실패");
	}

	const data = await response.json();
	return Array.isArray(data) ? data : [];
};
