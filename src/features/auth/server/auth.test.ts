import { describe, expect, it, vi } from "vitest";
import { decode, encode } from "next-auth/jwt";
import { getSafeCallbackUrl } from "../safeCallbackUrl";
import {
	AuthConfigurationError,
	getMissingAuthEnvironmentKeys,
	loadAuthEnvironment,
	type AuthEnvironment,
} from "./authEnvironment";
import {
	createJwtCallback,
	createRedirectCallback,
	createSessionCallback,
} from "./authCallbacks";
import { createAuthOptions } from "./createAuthOptions";
import {
	exchangeGoogleIdentity,
	exchangeIdentity,
	GoogleExchangeError,
} from "./googleExchange";

const AUTH_ENVIRONMENT: AuthEnvironment = {
	nextAuthSecret: "nextauth-secret-with-at-least-32-characters",
	nextAuthUrl: "https://supersohee.example.test",
	googleClientId: "google-client-id",
	googleClientSecret: "google-client-secret",
	backendApiUrl: "https://backend.example.test",
	authExchangeKey: "exchange-key-with-at-least-32-characters",
};

const BACKEND_TOKEN = "backend-access-token-that-must-stay-server-side";

describe("authentication environment", () => {
	it("fails safely when required values are missing", () => {
		expect(() => loadAuthEnvironment({})).toThrow(AuthConfigurationError);
		expect(() => loadAuthEnvironment({})).toThrow("NEXTAUTH_SECRET");
	});

	it("lets public pages detect unavailable authentication without loading secrets", () => {
		expect(
			getMissingAuthEnvironmentKeys({
				NEXTAUTH_SECRET: AUTH_ENVIRONMENT.nextAuthSecret,
				NEXTAUTH_URL: AUTH_ENVIRONMENT.nextAuthUrl,
			})
		).toEqual([
			"GOOGLE_CLIENT_ID",
			"GOOGLE_CLIENT_SECRET",
			"BACKEND_API_URL",
			"AUTH_EXCHANGE_KEY",
		]);
	});

	it("accepts complete dummy configuration without reading local env files", () => {
		expect(
			loadAuthEnvironment({
				NEXTAUTH_SECRET: AUTH_ENVIRONMENT.nextAuthSecret,
				NEXTAUTH_URL: `${AUTH_ENVIRONMENT.nextAuthUrl}/`,
				GOOGLE_CLIENT_ID: AUTH_ENVIRONMENT.googleClientId,
				GOOGLE_CLIENT_SECRET: AUTH_ENVIRONMENT.googleClientSecret,
				BACKEND_API_URL: `${AUTH_ENVIRONMENT.backendApiUrl}/`,
				AUTH_EXCHANGE_KEY: AUTH_ENVIRONMENT.authExchangeKey,
			})
		).toEqual(AUTH_ENVIRONMENT);
	});
});

describe("Google identity exchange", () => {
	it("sends the ID token server-to-server with exchange and idempotency headers", async () => {
		let capturedUrl = "";
		let capturedInit: RequestInit | undefined;
		const fetchImplementation: typeof fetch = vi.fn(
			async (input: RequestInfo | URL, init?: RequestInit) => {
				capturedUrl = input.toString();
				capturedInit = init;
				return new Response(
				JSON.stringify({
					accessToken: BACKEND_TOKEN,
					userId: "backend-user-6",
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
				);
			}
		);

		await expect(
			exchangeGoogleIdentity(
				"google-id-token",
				AUTH_ENVIRONMENT,
				fetchImplementation
			)
		).resolves.toEqual({
			backendAccessToken: BACKEND_TOKEN,
			backendUserId: "backend-user-6",
		});

		expect(fetchImplementation).toHaveBeenCalledOnce();
		expect(capturedUrl).toBe(
			"https://backend.example.test/api/auth/google/exchange"
		);
		expect(capturedInit?.headers).toMatchObject({
			"X-Supersohee-Exchange-Key": AUTH_ENVIRONMENT.authExchangeKey,
			"Idempotency-Key": expect.stringMatching(/^[a-f0-9]{64}$/),
		});
		expect(capturedInit?.body).toBe(
			JSON.stringify({ idToken: "google-id-token" })
		);
	});

	it("fails closed when the exchange rejects the login", async () => {
		const exchange = vi.fn().mockRejectedValue(new GoogleExchangeError());
		const jwt = createJwtCallback(exchange);

		await expect(
			jwt({
				token: { sub: "google-subject" },
				account: {
					provider: "google",
					type: "oauth",
					providerAccountId: "google-subject",
					id_token: "google-id-token",
				},
			})
		).rejects.toBeInstanceOf(GoogleExchangeError);
	});
});

describe("NextAuth callbacks", () => {
	it("exchanges exactly once on the initial Google callback", async () => {
		const exchange = vi.fn().mockResolvedValue({
			backendAccessToken: BACKEND_TOKEN,
			backendUserId: "backend-user-6",
		});
		const jwt = createJwtCallback(exchange);
		const initialToken = await jwt({
			token: { sub: "google-subject" },
			account: {
				provider: "google",
				type: "oauth",
				providerAccountId: "google-subject",
				id_token: "google-id-token",
			},
		});
		const refreshedToken = await jwt({ token: initialToken });

		expect(exchange).toHaveBeenCalledOnce();
		expect(refreshedToken.backendAccessToken).toBe(BACKEND_TOKEN);
		expect(JSON.stringify(refreshedToken)).not.toContain("google-id-token");
	});

	it("exposes only the backend user id through the public session", async () => {
		const session = await createSessionCallback()({
			session: {
				expires: "2099-01-01T00:00:00.000Z",
				user: { id: "temporary-id" },
			},
			token: {
				backendAccessToken: BACKEND_TOKEN,
				backendUserId: "backend-user-6",
			},
		});

		expect(session).toEqual({
			expires: "2099-01-01T00:00:00.000Z",
			user: { id: "backend-user-6" },
		});
		expect(JSON.stringify(session)).not.toContain(BACKEND_TOKEN);
	});

	it("keeps the backend token inside an encrypted NextAuth JWT", async () => {
		const encoded = await encode({
			secret: AUTH_ENVIRONMENT.nextAuthSecret,
			token: {
				backendAccessToken: BACKEND_TOKEN,
				backendUserId: "backend-user-6",
			},
			maxAge: 60,
		});

		expect(encoded).not.toContain(BACKEND_TOKEN);
		await expect(
			decode({ secret: AUTH_ENVIRONMENT.nextAuthSecret, token: encoded })
		).resolves.toMatchObject({ backendAccessToken: BACKEND_TOKEN });
	});

	it("enables PKCE, state, and nonce on the only public provider", () => {
		const options = createAuthOptions(AUTH_ENVIRONMENT, vi.fn());
		expect(options.providers).toHaveLength(1);
		expect(options.providers[0].id).toBe("google");
		expect(
			(options.providers[0] as { checks?: string[] }).checks
		).toEqual(["pkce", "state", "nonce"]);
	});
});

describe("safe callback URLs", () => {
	it.each([
		["/schedule?tab=next", "/schedule?tab=next"],
		["https://evil.example", "/home"],
		["//evil.example", "/home"],
		["/%2F%2Fevil.example", "/home"],
		["/\\evil.example", "/home"],
	])("normalizes %s", (input, expected) => {
		expect(getSafeCallbackUrl(input)).toBe(expected);
	});

	it("rejects an external redirect in the NextAuth callback", async () => {
		await expect(
			createRedirectCallback()({
				url: "https://evil.example/phishing",
				baseUrl: "https://supersohee.example",
			})
		).resolves.toBe("https://supersohee.example/home");
	});
});

/** loadAuthEnvironment가 통과하는 최소 구성. 여기에 카카오 값을 얹어 검증한다. */
const VALID_ENVIRONMENT = {
	NEXTAUTH_SECRET: AUTH_ENVIRONMENT.nextAuthSecret,
	NEXTAUTH_URL: AUTH_ENVIRONMENT.nextAuthUrl,
	GOOGLE_CLIENT_ID: AUTH_ENVIRONMENT.googleClientId,
	GOOGLE_CLIENT_SECRET: AUTH_ENVIRONMENT.googleClientSecret,
	BACKEND_API_URL: AUTH_ENVIRONMENT.backendApiUrl,
	AUTH_EXCHANGE_KEY: AUTH_ENVIRONMENT.authExchangeKey,
};

const KAKAO_ENVIRONMENT: AuthEnvironment = {
	...AUTH_ENVIRONMENT,
	kakao: {
		clientId: "kakao-rest-api-key",
		clientSecret: "kakao-client-secret",
		scope: "openid profile_nickname profile_image",
	},
};

describe("Kakao provider", () => {
	it("stays unregistered when credentials are absent, leaving Google untouched", () => {
		const options = createAuthOptions(AUTH_ENVIRONMENT, vi.fn());
		expect(options.providers.map((provider) => provider.id)).toEqual(["google"]);
	});

	it("registers alongside Google when credentials are present", () => {
		const options = createAuthOptions(KAKAO_ENVIRONMENT, vi.fn());
		expect(options.providers.map((provider) => provider.id)).toEqual([
			"google",
			"kakao",
		]);
	});

	/** openid가 빠지면 카카오가 id_token을 발급하지 않아 백엔드 교환이 불가능해진다. */
	it("requests openid so that Kakao issues an ID token", () => {
		const options = createAuthOptions(KAKAO_ENVIRONMENT, vi.fn());
		const kakao = options.providers[1] as {
			authorization?: { params?: { scope?: string } };
			idToken?: boolean;
			checks?: string[];
		};
		expect(kakao.authorization?.params?.scope).toContain("openid");
		expect(kakao.idToken).toBe(true);
		expect(kakao.checks).toEqual(["pkce", "state", "nonce"]);
	});

	/**
	 * discovery가 없으면 NextAuth가 id_token을 검증할 issuer/jwks_uri를 몰라
	 * "unexpected iss value, expected undefined"로 콜백이 실패한다.
	 */
	it("points at Kakao discovery so the ID token can be validated", () => {
		const options = createAuthOptions(KAKAO_ENVIRONMENT, vi.fn());
		const kakao = options.providers[1] as { wellKnown?: string };
		expect(kakao.wellKnown).toBe(
			"https://kauth.kakao.com/.well-known/openid-configuration"
		);
	});

	/** 내장 profile()은 /v2/user/me 응답 모양을 가정해 id_token 클레임에서는 전부 빈다. */
	it("maps the identity from ID token claims, not the userinfo shape", () => {
		const options = createAuthOptions(KAKAO_ENVIRONMENT, vi.fn());
		const kakao = options.providers[1] as unknown as {
			profile: (claims: Record<string, unknown>) => { id: string; name: unknown };
		};
		const mapped = kakao.profile({ sub: "kakao-subject", nickname: "소히팬" });
		expect(mapped.id).toBe("kakao-subject");
		expect(mapped.name).toBe("소히팬");
	});

	it("rejects a half-configured provider instead of silently disabling it", () => {
		expect(() =>
			loadAuthEnvironment({
				...VALID_ENVIRONMENT,
				KAKAO_CLIENT_ID: "kakao-rest-api-key",
			})
		).toThrow(AuthConfigurationError);
	});

	it("rejects a scope that would not produce an ID token", () => {
		expect(() =>
			loadAuthEnvironment({
				...VALID_ENVIRONMENT,
				KAKAO_CLIENT_ID: "kakao-rest-api-key",
				KAKAO_CLIENT_SECRET: "kakao-client-secret",
				KAKAO_SCOPE: "profile_nickname",
			})
		).toThrow(AuthConfigurationError);
	});

	it("exchanges the Kakao ID token at the Kakao endpoint", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({ accessToken: BACKEND_TOKEN, userId: "backend-user-9" }),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			)
		);

		const result = await exchangeIdentity(
			"kakao",
			"kakao-id-token",
			KAKAO_ENVIRONMENT,
			fetchMock as unknown as typeof fetch
		);

		expect(fetchMock.mock.calls[0][0]).toBe(
			"https://backend.example.test/api/auth/kakao/exchange"
		);
		expect(result.backendUserId).toBe("backend-user-9");
	});

	it("passes the provider through the JWT callback", async () => {
		const exchange = vi.fn().mockResolvedValue({
			backendAccessToken: BACKEND_TOKEN,
			backendUserId: "backend-user-9",
		});
		await createJwtCallback(exchange)({
			token: { sub: "kakao-subject" },
			account: {
				provider: "kakao",
				type: "oauth",
				providerAccountId: "kakao-subject",
				id_token: "kakao-id-token",
			},
		});

		expect(exchange).toHaveBeenCalledWith("kakao", "kakao-id-token");
	});

	/** NextAuth에 provider를 추가해도 백엔드 교환 경로가 없으면 통과시키지 않는다. */
	it("refuses a provider that has no backend exchange endpoint", async () => {
		const exchange = vi.fn();
		await expect(
			createJwtCallback(exchange)({
				token: { sub: "naver-subject" },
				account: {
					provider: "naver",
					type: "oauth",
					providerAccountId: "naver-subject",
					id_token: "naver-id-token",
				},
			})
		).rejects.toBeInstanceOf(GoogleExchangeError);
		expect(exchange).not.toHaveBeenCalled();
	});
});
