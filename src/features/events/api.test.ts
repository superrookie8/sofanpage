import { afterEach, describe, expect, it, vi } from "vitest";
import { eventHref, fetchEventDetail, normalizeEventDetails } from "./api";

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("event detail contract", () => {
	it("detail.photos의 presigned HTTP URL만 사진으로 사용한다", () => {
		expect(
			normalizeEventDetails({
				id: "event-test",
				title: "테스트 이벤트",
				photos: [
					"https://images.example.test/photo-a.webp?signature=test",
					"events/private-object-key.webp",
				],
				photoKeys: ["events/never-render-this.webp"],
			})
		).toMatchObject({
			photos: ["https://images.example.test/photo-a.webp?signature=test"],
		});
	});

	it("실제 상세 필드를 조회하고 event id를 URL 인코딩한다", async () => {
		const fetchMock = vi.fn(async () =>
			new Response(
				JSON.stringify({
					id: "event test",
					title: "테스트 이벤트",
					description: "테스트 설명",
					url: "/events/detail",
					checkFields: { check1: "확인 항목", check2: null, check3: null },
					photos: [],
				}),
				{ status: 200 }
			)
		);
		vi.stubGlobal("fetch", fetchMock);

		await expect(fetchEventDetail("event test")).resolves.toMatchObject({
			description: "테스트 설명",
			url: "/events/detail",
			photos: [],
		});
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/events/event%20test",
			expect.objectContaining({ cache: "no-store" })
		);
	});

	it("javascript와 protocol-relative URL을 노출하지 않는다", () => {
		expect(eventHref("javascript:alert(1)")).toBeNull();
		expect(eventHref("//untrusted.example.test/path")).toBeNull();
		expect(eventHref("/events/detail")).toBe("/events/detail");
	});
});
