export interface AuthEnvironment {
	nextAuthSecret: string;
	nextAuthUrl: string;
	googleClientId: string;
	googleClientSecret: string;
	backendApiUrl: string;
	authExchangeKey: string;
}

const REQUIRED_KEYS = [
	"NEXTAUTH_SECRET",
	"NEXTAUTH_URL",
	"GOOGLE_CLIENT_ID",
	"GOOGLE_CLIENT_SECRET",
	"BACKEND_API_URL",
	"AUTH_EXCHANGE_KEY",
] as const;

export function getMissingAuthEnvironmentKeys(
	environment: Record<string, string | undefined>
) {
	return REQUIRED_KEYS.filter((key) => !environment[key]?.trim());
}

export class AuthConfigurationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AuthConfigurationError";
	}
}

export function loadAuthEnvironment(
	environment: Record<string, string | undefined>
): AuthEnvironment {
	const missingKeys = getMissingAuthEnvironmentKeys(environment);
	if (missingKeys.length > 0) {
		throw new AuthConfigurationError(
			`Missing required authentication configuration: ${missingKeys.join(", ")}`
		);
	}

	const nextAuthSecret = environment.NEXTAUTH_SECRET!.trim();
	const authExchangeKey = environment.AUTH_EXCHANGE_KEY!.trim();
	if (nextAuthSecret.length < 32 || authExchangeKey.length < 32) {
		throw new AuthConfigurationError(
			"NEXTAUTH_SECRET and AUTH_EXCHANGE_KEY must each contain at least 32 characters"
		);
	}

	if (/\r|\n/.test(authExchangeKey)) {
		throw new AuthConfigurationError("AUTH_EXCHANGE_KEY contains invalid characters");
	}

	let backendUrl: URL;
	let nextAuthUrl: URL;
	try {
		backendUrl = new URL(environment.BACKEND_API_URL!);
		nextAuthUrl = new URL(environment.NEXTAUTH_URL!);
	} catch {
		throw new AuthConfigurationError(
			"NEXTAUTH_URL and BACKEND_API_URL must be valid URLs"
		);
	}
	if (
		!(["http:", "https:"] as string[]).includes(backendUrl.protocol) ||
		backendUrl.username ||
		backendUrl.password ||
		!(["http:", "https:"] as string[]).includes(nextAuthUrl.protocol) ||
		nextAuthUrl.username ||
		nextAuthUrl.password ||
		nextAuthUrl.pathname !== "/"
	) {
		throw new AuthConfigurationError(
			"Authentication URLs must use HTTP(S), contain no credentials, and NEXTAUTH_URL must be an origin"
		);
	}

	return {
		nextAuthSecret,
		nextAuthUrl: nextAuthUrl.toString().replace(/\/$/, ""),
		googleClientId: environment.GOOGLE_CLIENT_ID!.trim(),
		googleClientSecret: environment.GOOGLE_CLIENT_SECRET!.trim(),
		backendApiUrl: backendUrl.toString().replace(/\/$/, ""),
		authExchangeKey,
	};
}
