// src/features/events/api.ts
import type { Event, EventDetails } from "./types";

function httpUrl(value: unknown): string | null {
	if (typeof value !== "string" || !value.trim()) return null;
	try {
		const url = new URL(value.trim());
		return url.protocol === "http:" || url.protocol === "https:"
			? url.toString()
			: null;
	} catch {
		return null;
	}
}

export function eventHref(value: unknown): string | null {
	if (typeof value !== "string" || !value.trim()) return null;
	const href = value.trim();
	if (href.startsWith("/") && !href.startsWith("//")) return href;
	return httpUrl(href);
}

export function normalizeEventDetails(data: unknown): EventDetails {
	const record = (data ?? {}) as Record<string, unknown>;
	const checks = (record.checkFields ?? {}) as Record<string, unknown>;
	const checkValue = (key: string) => {
		const value = checks[key];
		return typeof value === "string" && value.trim() ? value.trim() : null;
	};
	const photos = Array.isArray(record.photos)
		? record.photos.map(httpUrl).filter((url): url is string => url !== null)
		: [];

	return {
		id: typeof record.id === "string" ? record.id : "",
		title: typeof record.title === "string" ? record.title : "",
		url: eventHref(record.url),
		description:
			typeof record.description === "string" && record.description.trim()
				? record.description
				: null,
		checkFields: {
			check1: checkValue("check1"),
			check2: checkValue("check2"),
			check3: checkValue("check3"),
		},
		photos,
	};
}

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
	const response = await fetch(`/api/events/${encodeURIComponent(eventId)}`, {
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
	return normalizeEventDetails(data);
};
