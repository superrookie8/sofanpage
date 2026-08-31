import { describe, expect, it } from "vitest";
import {
	ARCADE_API_BASE_PATH,
	ARCADE_NAV_ITEM,
	ARCADE_UNITY_BUILD,
} from "./config";
import {
	isMvpDisabledApi,
	isMvpDisabledPage,
} from "../mvp/accessPolicy";

describe("MVP arcade availability", () => {
	it("keeps the arcade in public navigation and route policy", () => {
		expect(ARCADE_NAV_ITEM).toEqual({ href: "/arcade", label: "아케이드" });
		expect(isMvpDisabledPage(ARCADE_NAV_ITEM.href)).toBe(false);
		expect(isMvpDisabledPage("/diary/read")).toBe(true);
	});

	it("keeps arcade BFF routes available while photos stay private", () => {
		expect(isMvpDisabledApi(`${ARCADE_API_BASE_PATH}/ranking`)).toBe(false);
		expect(isMvpDisabledApi("/api/photos")).toBe(true);
	});

	it("loads only the active second Unity build", () => {
		expect(ARCADE_UNITY_BUILD.codeUrl).toBe("/Build/sohee_run_2nd.wasm");
		expect(Object.values(ARCADE_UNITY_BUILD)).not.toContain(
			"/Build/sohee_run.wasm"
		);
	});
});
