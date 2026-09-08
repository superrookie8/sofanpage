import type { InternationalResult } from "./types";

export async function fetchInternationalResults(): Promise<InternationalResult[]> {
	const response = await fetch("/api/international-results", {
		method: "GET",
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(`국제대회 기록을 불러오지 못했습니다. (${response.status})`);
	}

	const data: unknown = await response.json();
	if (!Array.isArray(data)) {
		throw new Error("국제대회 기록 응답 형식이 올바르지 않습니다.");
	}

	return data as InternationalResult[];
}
