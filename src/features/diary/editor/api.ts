// src/features/diary/editor/api.ts
import type { StadiumInfo } from "@/features/games/types";
import { encodeStadiumPathParam } from "@/lib/stadium/encodeStadiumPathParam";
import { diaryEditLog } from "./debug";

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
	const encoded = encodeStadiumPathParam(stadiumId);
	const url = `/api/stadiums/${encoded}/seats/hierarchy`;
	diaryEditLog("fetchSeatHierarchy", { stadiumId, url });
	const response = await fetch(url, {
		method: "GET",
		cache: "no-store",
	});

	if (!response.ok) {
		let message = "좌석 계층 구조 조회 실패";
		try {
			const body = await response.json();
			if (body?.message) message = body.message;
		} catch {
			// ignore
		}
		throw new Error(`${message} (${response.status})`);
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

	const encoded = encodeStadiumPathParam(stadiumId);
	const response = await fetch(
		`/api/stadiums/${encoded}/seat?${params.toString()}`,
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
