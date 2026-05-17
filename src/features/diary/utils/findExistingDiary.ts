import { checkDiaryByDate, checkDiaryByGameId } from "../api";
import type { DiaryCheckResponse } from "../types";

export type ExistingDiaryResult = {
	diaryId: string;
	diary: DiaryCheckResponse["diary"];
};

/**
 * 일지 중복 확인
 * - gameId가 있으면 해당 경기 일지만 검사 (date로 넘어가지 않음)
 * - gameId 없이 date만 있으면 날짜 기준 검사
 */
export async function findExistingDiary(params: {
	gameId?: string;
	date?: string;
}): Promise<ExistingDiaryResult | null> {
	const gameId = params.gameId?.trim();
	const date = params.date?.trim().slice(0, 10);

	if (gameId) {
		const check = await checkDiaryByGameId(gameId);
		if (check.exists && check.diaryId) {
			return { diaryId: check.diaryId, diary: check.diary };
		}
		return null;
	}

	if (date) {
		const check = await checkDiaryByDate(date);
		if (check.exists && check.diaryId) {
			return { diaryId: check.diaryId, diary: check.diary };
		}
	}

	return null;
}
