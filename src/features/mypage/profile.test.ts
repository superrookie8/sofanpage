import { afterEach, describe, expect, it, vi } from "vitest";

type FetchArgs = [string, RequestInit];

/** vi.fn의 기본 추론으로는 mock.calls가 빈 튜플이라 인자 타입을 명시한다. */
function stubFetch(response: () => Response) {
	const mock = vi.fn((_input: string, _init?: RequestInit) =>
		Promise.resolve(response())
	);
	vi.stubGlobal("fetch", mock);
	return mock;
}
import {
	NICKNAME_MAX_LENGTH,
	ProfileValidationError,
	checkNicknameAvailable,
	updateUserInfo,
	uploadProfileImage,
	validateNickname,
	validateProfileImage,
} from "./api";

function imageFile(type: string, bytes = 10) {
	return new File([new Uint8Array(bytes)], "photo", { type });
}

afterEach(() => vi.unstubAllGlobals());

describe("nickname rules mirror the backend", () => {
	it("accepts Hangul, latin, digits and . _ -", () => {
		expect(validateNickname("  직관요정  ")).toBe("직관요정");
		expect(validateNickname("fan_2026")).toBe("fan_2026");
		expect(validateNickname("a.b-c")).toBe("a.b-c");
	});

	it("rejects too short, too long and disallowed characters", () => {
		for (const invalid of ["x", "가".repeat(NICKNAME_MAX_LENGTH + 1), "빈 칸", "이모지🎉", "슬래시/"]) {
			expect(() => validateNickname(invalid)).toThrow(ProfileValidationError);
		}
	});
});

describe("profile image rules", () => {
	it("accepts jpeg, png and webp under 5MB", () => {
		for (const type of ["image/jpeg", "image/png", "image/webp"]) {
			expect(validateProfileImage(imageFile(type)).type).toBe(type);
		}
	});

	it("rejects other types and oversized files", () => {
		expect(() => validateProfileImage(imageFile("image/gif"))).toThrow(ProfileValidationError);
		expect(() => validateProfileImage(imageFile("application/pdf"))).toThrow(ProfileValidationError);
		expect(() =>
			validateProfileImage(imageFile("image/png", 5 * 1024 * 1024 + 1))
		).toThrow(ProfileValidationError);
	});
});

describe("profile requests", () => {
	it("uploads the file first and returns the R2 key", async () => {
		const fetchMock = stubFetch(
			() => new Response(JSON.stringify({ key: "diary/abc.png" }), { status: 200 })
		);

		await expect(uploadProfileImage(imageFile("image/png"))).resolves.toBe("diary/abc.png");
		const [url, init] = fetchMock.mock.calls[0] as FetchArgs;
		expect(url).toBe("/api/users/me/photo");
		expect(init.method).toBe("POST");
		expect(init.body).toBeInstanceOf(FormData);
	});

	it("fails loudly when the upload returns no key", async () => {
		stubFetch(() => new Response("{}", { status: 200 }));
		await expect(uploadProfileImage(imageFile("image/png"))).rejects.toThrow();
	});

	it("PATCHes only the changed fields", async () => {
		const fetchMock = stubFetch(
			() => new Response(JSON.stringify({ nickname: "새이름" }), { status: 200 })
		);

		await updateUserInfo({ nickname: "새이름" });
		const [url, init] = fetchMock.mock.calls[0] as FetchArgs;
		expect(url).toBe("/api/users/me");
		expect(init.method).toBe("PATCH");
		expect(JSON.parse(init.body as string)).toEqual({ nickname: "새이름" });
	});

	it("surfaces the server message when a nickname is taken", async () => {
		stubFetch(
			() => new Response(JSON.stringify({ message: "이미 사용 중인 닉네임입니다." }), { status: 409 })
		);
		await expect(updateUserInfo({ nickname: "중복" })).rejects.toThrow(
			"이미 사용 중인 닉네임입니다."
		);
	});

	it("reads availability from the check endpoint", async () => {
		const fetchMock = stubFetch(
			() => new Response(JSON.stringify({ available: true }), { status: 200 })
		);

		await expect(checkNicknameAvailable("직관요정")).resolves.toBe(true);
		expect((fetchMock.mock.calls[0] as FetchArgs)[0]).toBe(
			`/api/auth/check-nickname?nickname=${encodeURIComponent("직관요정")}`
		);
	});
});
