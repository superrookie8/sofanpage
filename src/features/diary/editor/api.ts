// src/features/diary/editor/api.ts
import type { StadiumInfo } from "@/features/games/types";

// 경기장 목록 조회
export const fetchStadiums = async (): Promise<StadiumInfo[]> => {
	const response = await fetch("/api/stadiums", {
		method: "GET",
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("경기장 목록 조회 실패");
	}

	const data = await response.json();
	return Array.isArray(data) ? data : [];
};

// 좌석 계층 구조 조회
export interface SeatHierarchyResponse {
	zones: Array<{
		zoneName: string;
		seatType: string;
		floor: string | null;
		blocks: Array<{
			blockName: string;
			rows: Array<{
				row: string;
				numbers: string[];
			}>;
		}> | null;
		rows: Array<{
			row: string;
			numbers: string[];
		}> | null;
	}>;
}

export const fetchSeatHierarchy = async (
	stadiumId: string
): Promise<SeatHierarchyResponse> => {
	const response = await fetch(`/api/stadiums/${stadiumId}/seats/hierarchy`, {
		method: "GET",
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("좌석 계층 구조 조회 실패");
	}

	const data = await response.json();
	return data;
};

// 좌석 ID 조회
export const fetchSeatId = async (
	stadiumId: string,
	zoneName: string,
	row: string,
	number: string,
	blockName?: string
): Promise<string> => {
	const params = new URLSearchParams({
		zoneName,
		row,
		number,
	});
	if (blockName) {
		params.append("blockName", blockName);
	}

	const response = await fetch(
		`/api/stadiums/${stadiumId}/seat?${params.toString()}`,
		{
			method: "GET",
			cache: "no-store",
		}
	);

	if (!response.ok) {
		throw new Error("좌석 ID 조회 실패");
	}

	const data = await response.json();
	return data;
};
