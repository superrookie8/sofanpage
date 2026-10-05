import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CELEBRATION_END, nextKstMidnight, shouldShowCelebration } from "./celebration";
import { CelebrationBanner } from "./components/celebrationPopup";

afterEach(() => vi.unstubAllGlobals());

describe("아시안게임 금메달 축하 팝업", () => {
	const morning = Date.parse("2026-10-05T09:30:00+09:00");

	it("기간 안에서만, 오늘 하루 숨김이 끝난 뒤에 다시 뜬다", () => {
		expect(shouldShowCelebration(morning, null)).toBe(true);
		expect(shouldShowCelebration(morning, nextKstMidnight(morning))).toBe(false);
		expect(shouldShowCelebration(nextKstMidnight(morning), nextKstMidnight(morning))).toBe(true);
		expect(shouldShowCelebration(morning, Number.NaN)).toBe(true);
		expect(shouldShowCelebration(CELEBRATION_END - 1, null)).toBe(true);
		expect(shouldShowCelebration(CELEBRATION_END, null)).toBe(false);
	});

	it("오늘 하루 보지 않기는 한국시간 자정까지다", () => {
		expect(new Date(nextKstMidnight(morning)).toISOString()).toBe("2026-10-05T15:00:00.000Z");
		const lateNight = Date.parse("2026-10-05T23:59:00+09:00");
		expect(nextKstMidnight(lateNight)).toBe(Date.parse("2026-10-06T00:00:00+09:00"));
	});

	it("현수막 문구와 이동·닫기 버튼을 보여 준다", () => {
		vi.stubGlobal("React", React);
		const html = renderToStaticMarkup(<CelebrationBanner onClose={() => {}} onHideToday={() => {}} />);
		for (const text of ["경축", "이소희 선수", "2026 아이치·나고야 아시안게임", "여자농구 금메달 획득", "- 이소희 희망단 일동 -", "오늘 하루 보지 않기", "닫기"]) {
			expect(html).toContain(text);
		}
		expect(html).toContain('href="/videos"');
	});
});
