import { afterEach, describe, expect, it, vi } from "vitest";

const getTokenMock = vi.hoisted(() => vi.fn());

vi.mock("next-auth/jwt", () => ({ getToken: getTokenMock }));
vi.mock("../../../config/auth", () => ({ getAuthEnvironment: vi.fn() }));

import { getOptionalRequestAccessToken } from "./getRequestAccessToken";

afterEach(() => {
	getTokenMock.mockReset();
	vi.unstubAllEnvs();
});

describe("getOptionalRequestAccessToken", () => {
	it("NEXTAUTH_SECRET이 없으면 복호화를 시도하지 않고 익명으로 진행한다", async () => {
		vi.stubEnv("NEXTAUTH_SECRET", "");

		await expect(
			getOptionalRequestAccessToken({} as never)
		).resolves.toBeNull();
		expect(getTokenMock).not.toHaveBeenCalled();
	});

	it("손상된 선택적 세션 쿠키도 익명 요청으로 처리한다", async () => {
		vi.stubEnv("NEXTAUTH_SECRET", "a-valid-enough-secret");
		getTokenMock.mockRejectedValueOnce(new Error("decode failed"));

		await expect(
			getOptionalRequestAccessToken({} as never)
		).resolves.toBeNull();
	});

	it("유효한 선택적 세션의 backend token을 개인화 요청에 전달한다", async () => {
		vi.stubEnv("NEXTAUTH_SECRET", "a-valid-enough-secret");
		const request = {} as never;
		getTokenMock.mockResolvedValueOnce({ backendAccessToken: "backend-token" });

		await expect(getOptionalRequestAccessToken(request)).resolves.toBe(
			"backend-token"
		);
		expect(getTokenMock).toHaveBeenCalledWith({
			req: request,
			secret: "a-valid-enough-secret",
		});
	});
});
