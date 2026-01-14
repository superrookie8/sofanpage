// src/features/diary/api.ts
import clientAxiosService from "@/lib/client/http/axiosService";
import type { DiaryEntry, CreateDiaryRequest, DiaryListFilter } from "./types";

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

// gameId로 일지 조회 (없으면 null)
export const fetchDiaryByGameId = async (
	gameId: string
): Promise<DiaryEntry | null> => {
	try {
		const response = await clientAxiosService.get<DiaryEntry | null>(
			`/api/diary/game/${gameId}`
		);
		return response.data ?? null;
	} catch (error: any) {
		// 404 에러는 해당 경기에 대한 일지가 없다는 의미이므로 null 반환
		if (error.response?.status === 404) {
			return null;
		}
		// 다른 에러는 다시 던짐
		throw error;
	}
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
