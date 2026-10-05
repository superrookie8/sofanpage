/** 2026 아시안게임 금메달 축하 팝업. 기간이 지나면 코드 수정 없이 더 이상 뜨지 않는다. */
export const CELEBRATION_END = Date.parse("2026-11-01T00:00:00+09:00");
export const CELEBRATION_STORAGE_KEY = "supersohee:ag-gold-2026:hidden-until";

const KST_OFFSET = 9 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

export function shouldShowCelebration(now: number, hiddenUntil: number | null): boolean {
	if (now >= CELEBRATION_END) return false;
	return hiddenUntil === null || !Number.isFinite(hiddenUntil) || now >= hiddenUntil;
}

/** "오늘 하루 보지 않기"는 한국시간 자정까지 숨긴다. */
export function nextKstMidnight(now: number): number {
	return Math.floor((now + KST_OFFSET) / DAY) * DAY + DAY - KST_OFFSET;
}

export function readHiddenUntil(): number | null {
	try {
		const value = window.localStorage.getItem(CELEBRATION_STORAGE_KEY);
		return value === null ? null : Number(value);
	} catch {
		return null;
	}
}

export function hideCelebrationForToday(now: number) {
	try {
		window.localStorage.setItem(CELEBRATION_STORAGE_KEY, String(nextKstMidnight(now)));
	} catch {
		// 저장소를 쓸 수 없는 브라우저에서는 이번 방문 동안만 닫는다.
	}
}
