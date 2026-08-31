import { createHash } from "node:crypto";
import type { AuthEnvironment } from "./authEnvironment";

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

function createIdempotencyKey(idToken: string) {
	return createHash("sha256")
		.update("supersohee:google-exchange:")
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

export async function exchangeGoogleIdentity(
	idToken: string,
	environment: AuthEnvironment,
	fetchImplementation: typeof fetch = fetch
): Promise<GoogleExchangeResult> {
	if (!idToken) {
		throw new GoogleExchangeError("Google ID token is missing");
	}

	let response: Response;
	try {
		response = await fetchImplementation(
			`${environment.backendApiUrl}/api/auth/google/exchange`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Supersohee-Exchange-Key": environment.authExchangeKey,
					"Idempotency-Key": createIdempotencyKey(idToken),
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
		throw new GoogleExchangeError("Google identity exchange returned invalid data");
	}

	if (!isExchangeResponse(result)) {
		throw new GoogleExchangeError("Google identity exchange returned invalid data");
	}

	return {
		backendAccessToken: result.accessToken,
		backendUserId: result.userId,
	};
}
