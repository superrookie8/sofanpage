import { createHash } from "node:crypto";
import type { AuthEnvironment } from "./authEnvironment";

/** 백엔드에 exchange endpoint가 있는 provider. 경로는 /api/auth/{provider}/exchange 다. */
export type IdentityProvider = "google" | "kakao";

export interface GoogleExchangeResult {
	backendAccessToken: string;
	backendUserId: string;
}

interface BackendGoogleExchangeResponse {
	accessToken: string;
	userId: string;
}

export class GoogleExchangeError extends Error {
	constructor(message = "Google identity exchange failed") {
		super(message);
		this.name = "GoogleExchangeError";
	}
}

function createIdempotencyKey(provider: IdentityProvider, idToken: string) {
	return createHash("sha256")
		.update(`supersohee:${provider}-exchange:`)
		.update(idToken)
		.digest("hex");
}

function isExchangeResponse(
	value: unknown
): value is BackendGoogleExchangeResponse {
	if (typeof value !== "object" || value === null) return false;
	const candidate = value as Record<string, unknown>;
	return (
		typeof candidate.accessToken === "string" &&
		candidate.accessToken.length > 0 &&
		typeof candidate.userId === "string" &&
		candidate.userId.length > 0
	);
}

export async function exchangeIdentity(
	provider: IdentityProvider,
	idToken: string,
	environment: AuthEnvironment,
	fetchImplementation: typeof fetch = fetch
): Promise<GoogleExchangeResult> {
	if (!idToken) {
		throw new GoogleExchangeError("Identity token is missing");
	}

	let response: Response;
	try {
		response = await fetchImplementation(
			`${environment.backendApiUrl}/api/auth/${provider}/exchange`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Supersohee-Exchange-Key": environment.authExchangeKey,
					"Idempotency-Key": createIdempotencyKey(provider, idToken),
				},
				body: JSON.stringify({ idToken }),
				cache: "no-store",
				signal: AbortSignal.timeout(8_000),
			}
		);
	} catch {
		throw new GoogleExchangeError();
	}

	if (!response.ok) {
		throw new GoogleExchangeError();
	}

	let result: unknown;
	try {
		result = await response.json();
	} catch {
		throw new GoogleExchangeError("Identity exchange returned invalid data");
	}

	if (!isExchangeResponse(result)) {
		throw new GoogleExchangeError("Identity exchange returned invalid data");
	}

	return {
		backendAccessToken: result.accessToken,
		backendUserId: result.userId,
	};
}

/** 기존 호출부 호환. 신규 코드는 exchangeIdentity를 직접 쓴다. */
export function exchangeGoogleIdentity(
	idToken: string,
	environment: AuthEnvironment,
	fetchImplementation: typeof fetch = fetch
): Promise<GoogleExchangeResult> {
	return exchangeIdentity("google", idToken, environment, fetchImplementation);
}
