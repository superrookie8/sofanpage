// src/features/diary/api.ts
import { isAxiosError } from "axios";
import clientAxiosService from "@/lib/client/http/axiosService";
import type {
	DiaryCheckResponse,
	DiaryEntry,
	CreateDiaryRequest,
	DiaryListFilter,
} from "./types";

/** 일지 없음 — 백엔드가 404를 반환하는 경우에도 동일하게 취급 */
const NO_DIARY_CHECK: DiaryCheckResponse = {
	exists: false,
	diaryId: null,
	diary: null,
};

// 전체 일지 목록 조회
export const fetchAllDiaries = async (
	filter?: DiaryListFilter
): Promise<DiaryEntry[]> => {
	try {
		const response = await clientAxiosService.get<DiaryEntry[]>(`/api/diary`);
		const data = response.data;

		if (Array.isArray(data)) {
			// 닉네임 필터가 있으면 필터링
			if (filter?.nickname) {
				return data.filter(
					(diary: DiaryEntry) => diary.nickname === filter.nickname
				);
			}
			return data;
		} else {
			return [];
		}
	} catch (error) {
		console.error("Error fetching all diaries:", error);
		return [];
	}
};

// 개인 일지 목록 조회
export const fetchPersonalDiaries = async (
	filter: DiaryListFilter
): Promise<DiaryEntry[]> => {
	try {
		// 내 일지 목록 조회는 /api/diary 사용 (백엔드에서 자동으로 본인 일지만 반환)
		const response = await clientAxiosService.get<DiaryEntry[]>(`/api/diary`);
		const data = response.data;

		if (Array.isArray(data)) {
			// 닉네임 필터링 (필요한 경우)
			return data.filter(
				(diary: DiaryEntry) => diary.nickname === filter.nickname
			);
		} else {
			return [];
		}
	} catch (error) {
		console.error("Error fetching personal diaries:", error);
		return [];
	}
};

// 일지 상세 조회
export const fetchDiaryById = async (diaryId: string): Promise<DiaryEntry> => {
	const response = await clientAxiosService.get<DiaryEntry>(
		`/api/diary/${diaryId}`
	);
	return response.data;
};

// 경기(gameId) 기준 일지 존재 여부 확인
export const checkDiaryByGameId = async (
	gameId: string
): Promise<DiaryCheckResponse> => {
	try {
		const response = await clientAxiosService.get<DiaryCheckResponse>(
			`/api/diary/game/${encodeURIComponent(gameId)}`,
			{ skipAuthRedirect: true }
		);
		return response.data;
	} catch (error) {
		if (isAxiosError(error) && error.response?.status === 404) {
			return NO_DIARY_CHECK;
		}
		throw error;
	}
};

// 날짜 기준 일지 존재 여부 확인 (yyyy-MM-dd)
export const checkDiaryByDate = async (
	date: string
): Promise<DiaryCheckResponse> => {
	try {
		const response = await clientAxiosService.get<DiaryCheckResponse>(
			`/api/diary/date/${encodeURIComponent(date)}`,
			{ skipAuthRedirect: true }
		);
		return response.data;
	} catch (error) {
		if (isAxiosError(error) && error.response?.status === 404) {
			return NO_DIARY_CHECK;
		}
		throw error;
	}
};

/** @deprecated checkDiaryByGameId 사용 권장 */
export const fetchDiaryByGameId = async (
	gameId: string
): Promise<DiaryEntry | null> => {
	const check = await checkDiaryByGameId(gameId);
	return check.exists && check.diary ? check.diary : null;
};

// 일지 생성
export const createDiary = async (
	data: CreateDiaryRequest
): Promise<DiaryEntry> => {
	const response = await clientAxiosService.post<DiaryEntry>(
		"/api/diary",
		data
	);
	return response.data;
};

// 일지 수정
export const updateDiary = async (
	diaryId: string,
	data: Partial<CreateDiaryRequest>
): Promise<DiaryEntry> => {
	const response = await clientAxiosService.put<DiaryEntry>(
		`/api/diary/${diaryId}`,
		data
	);
	return response.data;
};

// 일지 삭제
export const deleteDiary = async (diaryId: string): Promise<void> => {
	const response = await clientAxiosService.delete(`/api/diary/${diaryId}`);
	if (response.status !== 200) {
		const errorData = response.data;
		throw new Error(errorData.message || "일지 삭제 실패");
	}
};

// 사용자 통계 조회
export const fetchUserStats = async (
	nickname: string
): Promise<{
	win_percentage: number;
	sunny_percentage: number;
	home_win_percentage: number;
	away_win_percentage: number;
	attendance_percentage: number;
}> => {
	try {
		const response = await fetch(`/api/diary/stats?nickname=${nickname}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch user stats");
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching user stats:", error);
		return {
			win_percentage: 0,
			sunny_percentage: 0,
			home_win_percentage: 0,
			away_win_percentage: 0,
			attendance_percentage: 0,
		}; // 오류 발생 시 기본 값 반환
	}
};
