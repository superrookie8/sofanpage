import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	WithdrawalConsequences,
	withdrawalProviderIds,
} from "./components/accountWithdrawalSheet";
import {
	clearWithdrawalAccountMarker,
	consumeWithdrawalAccountMarker,
	deleteAccount,
	markWithdrawalAccount,
	WITHDRAWAL_CONFIRMATION,
	WITHDRAWAL_SUMMARY,
} from "./withdrawal";

beforeEach(() => vi.stubGlobal("React", React));
afterEach(() => vi.unstubAllGlobals());

it("explains every material consequence before withdrawal", () => {
	const html = renderToStaticMarkup(React.createElement(WithdrawalConsequences));
	expect(html).toContain("계정, 프로필, 계정과 연결된 직관일지, 아케이드 최고 점수와 순위가 삭제");
	expect(html).toContain("공개 랭킹에서도 닉네임과 점수가 제거");
	expect(html).toContain("복구할 수 없습니다");
	expect(html).toContain("과거 방명록");
	expect(html).toContain("소유를 확인하기 어려운 기존 직관일지 사진");
	expect(html).toContain("Google·Kakao 계정");
	expect(html).toContain("자동으로 해지되지는 않습니다");
});

it("keeps the mypage danger summary aligned with the backend deletion scope", () => {
	expect(WITHDRAWAL_SUMMARY).toContain("계정과 연결된 직관일지");
	expect(WITHDRAWAL_SUMMARY).toContain("아케이드 기록");
});

it("offers only the social provider already connected to the account", () => {
	const available = { google: {}, kakao: {}, credentials: {} };
	expect(withdrawalProviderIds(available, "google")).toEqual(["google"]);
	expect(withdrawalProviderIds(available, "kakao")).toEqual(["kakao"]);
	expect(withdrawalProviderIds(available, null)).toEqual([]);
});

it("opens confirmation only for the exact account marked before OAuth", () => {
	const values = new Map<string, string>();
	const storage = {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => values.set(key, value),
		removeItem: (key: string) => values.delete(key),
	};

	expect(markWithdrawalAccount(storage, "user-1")).toBe(true);
	expect(consumeWithdrawalAccountMarker(storage, "user-2")).toEqual({
		expectedAccountId: "user-1",
		matches: false,
	});
	// 불일치 marker도 즉시 소비되므로 다시 시도해 확인 단계를 열 수 없다.
	expect(consumeWithdrawalAccountMarker(storage, "user-1").matches).toBe(false);
	expect(markWithdrawalAccount(storage, "user-1")).toBe(true);
	expect(consumeWithdrawalAccountMarker(storage, "user-1").matches).toBe(true);
	expect(markWithdrawalAccount(storage, "user-1")).toBe(true);
	clearWithdrawalAccountMarker(storage);
	expect(consumeWithdrawalAccountMarker(storage, "user-1").matches).toBe(false);
});

describe("deleteAccount", () => {
	it("sends the exact confirmation as JSON", async () => {
		const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
		vi.stubGlobal("fetch", fetchMock);
		await deleteAccount(WITHDRAWAL_CONFIRMATION);
		expect(fetchMock).toHaveBeenCalledWith("/api/users/me", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ confirmation: WITHDRAWAL_CONFIRMATION }),
		});
	});

	it.each([[400, "확인 문구"], [401, "로그인 정보"], [412, "다시 인증"], [503, "준비하고 있습니다"]])(
		"maps status %i to actionable copy",
		async (status, message) => {
			vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status })));
			await expect(deleteAccount(WITHDRAWAL_CONFIRMATION)).rejects.toMatchObject({
				status,
				message: expect.stringContaining(message),
			});
		}
	);
});
