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
