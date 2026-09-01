import { afterEach, describe, expect, it, vi } from "vitest";
import { sanitizeParams } from "./gtag";
import { EVENT_NAMES } from "./events";

describe("GA4 파라미터 정리", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("값이 비었으면 뺀다 — GA4에서 (not set)으로 잡혀 리포트가 더러워진다", () => {
		expect(
			sanitizeParams({ a: undefined, b: null, c: "", d: 0, e: false })
		).toEqual({ d: 0, e: false });
	});

	it("개인정보로 보이는 키는 버린다", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		expect(
			sanitizeParams({
				nav_item: "뉴스",
				email: "a@b.com",
				nickname: "소히팬",
				user_name: "이름",
				access_token: "secret",
			})
		).toEqual({ nav_item: "뉴스" });
	});

	it("문자열은 GA4 상한인 100자로 자른다", () => {
		const value = sanitizeParams({ title: "가".repeat(150) }).title;
		expect(value).toHaveLength(100);
	});
});

describe("이벤트 택소노미", () => {
	it("이름은 snake_case 소문자에 40자 이내여야 한다 — GA4 제약", () => {
		for (const name of EVENT_NAMES) {
			expect(name).toMatch(/^[a-z][a-z0-9_]*$/);
			expect(name.length).toBeLessThanOrEqual(40);
		}
	});

	it("이름이 중복되지 않는다", () => {
		expect(new Set(EVENT_NAMES).size).toBe(EVENT_NAMES.length);
	});
});
