import { checkDiaryByDate, checkDiaryByGameId } from "../api";
import type { DiaryCheckResponse } from "../types";

export type ExistingDiaryResult = {
	diaryId: string;
	diary: DiaryCheckResponse["diary"];
};

/** 백엔드와 동일: gameId 우선, 없으면 date(yyyy-MM-dd) */
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
	}

	if (date) {
		const check = await checkDiaryByDate(date);
		if (check.exists && check.diaryId) {
			return { diaryId: check.diaryId, diary: check.diary };
		}
	}

	return null;
}
