export interface AuthEnvironment {
	nextAuthSecret: string;
	nextAuthUrl: string;
	googleClientId: string;
	googleClientSecret: string;
	backendApiUrl: string;
	authExchangeKey: string;
	/**
	 * 카카오는 선택 provider다. 자격증명이 없으면 provider를 등록하지 않으며
	 * Google 로그인은 영향받지 않는다(PRD §7.4.1의 provider별 kill switch).
	 */
	kakao?: KakaoProviderEnvironment;
}

export interface KakaoProviderEnvironment {
	clientId: string;
	clientSecret: string;
	/**
	 * 이메일 동의항목은 비즈 앱 심사를 통과해야 요청할 수 있고, 승인 전에 요청하면
	 * 카카오가 인가 단계에서 거부한다. 심사가 끝나면 KAKAO_SCOPE에 account_email을
	 * 추가하는 것만으로 코드 변경 없이 켤 수 있게 환경변수로 둔다.
	 */
	scope: string;
}

/** openid가 빠지면 카카오가 id_token을 발급하지 않는다. 기본값에서 절대 빼지 말 것. */
export const DEFAULT_KAKAO_SCOPE = "openid profile_nickname profile_image";

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
		kakao: loadKakaoEnvironment(environment),
	};
}

/**
 * 둘 중 하나만 설정된 상태는 설정 실수다. 조용히 카카오를 끄면 원인을 찾기 어려우므로
 * 명시적으로 실패시킨다. 둘 다 없으면 카카오를 쓰지 않는 정상 상태다.
 */
function loadKakaoEnvironment(
	environment: Record<string, string | undefined>
): KakaoProviderEnvironment | undefined {
	const clientId = environment.KAKAO_CLIENT_ID?.trim();
	const clientSecret = environment.KAKAO_CLIENT_SECRET?.trim();

	if (!clientId && !clientSecret) return undefined;
	if (!clientId || !clientSecret) {
		throw new AuthConfigurationError(
			"KAKAO_CLIENT_ID and KAKAO_CLIENT_SECRET must be configured together"
		);
	}

	const scope = environment.KAKAO_SCOPE?.trim() || DEFAULT_KAKAO_SCOPE;
	if (!scope.split(/\s+/).includes("openid")) {
		throw new AuthConfigurationError(
			"KAKAO_SCOPE must include \"openid\"; Kakao issues no ID token without it"
		);
	}

	return { clientId, clientSecret, scope };
}
