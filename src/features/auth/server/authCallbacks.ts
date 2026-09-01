import type { Account, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { getSafeCallbackUrl } from "../safeCallbackUrl";
import type {
	GoogleExchangeResult,
	IdentityProvider,
} from "./googleExchange";
import { GoogleExchangeError } from "./googleExchange";

export type GoogleIdentityExchange = (
	provider: IdentityProvider,
	idToken: string
) => Promise<GoogleExchangeResult>;

/**
 * 백엔드 exchange endpoint가 있는 provider만 받는다. 새 provider를 NextAuth에
 * 추가해도 여기 등록하지 않으면 로그인이 통과하지 못한다(의도된 fail-closed).
 */
const SUPPORTED_PROVIDERS = new Set<string>(["google", "kakao"]);

export function createJwtCallback(exchangeIdentity: GoogleIdentityExchange) {
	return async ({
		token,
		account,
	}: {
		token: JWT;
		account?: Account | null;
	}): Promise<JWT> => {
		if (account) {
			if (!SUPPORTED_PROVIDERS.has(account.provider) || !account.id_token) {
				throw new GoogleExchangeError("Unsupported or incomplete OAuth response");
			}

			const exchange = await exchangeIdentity(
				account.provider as IdentityProvider,
				account.id_token
			);
			return {
				...token,
				backendAccessToken: exchange.backendAccessToken,
				backendUserId: exchange.backendUserId,
			};
		}

		if (
			typeof token.backendAccessToken !== "string" ||
			!token.backendAccessToken ||
			typeof token.backendUserId !== "string" ||
			!token.backendUserId
		) {
			throw new GoogleExchangeError("Backend authentication is missing");
		}

		return token;
	};
}

export function createSessionCallback() {
	return async ({ session, token }: { session: Session; token: JWT }) => {
		if (typeof token.backendUserId !== "string" || !token.backendUserId) {
			throw new GoogleExchangeError("Backend authentication is missing");
		}

		return {
			expires: session.expires,
			user: { id: token.backendUserId },
		};
	};
}

export function createRedirectCallback() {
	return async ({ url, baseUrl }: { url: string; baseUrl: string }) => {
		try {
			const target = new URL(url, baseUrl);
			if (target.origin !== new URL(baseUrl).origin) {
				return `${baseUrl}/home`;
			}
			return `${baseUrl}${getSafeCallbackUrl(
				`${target.pathname}${target.search}${target.hash}`
			)}`;
		} catch {
			return `${baseUrl}/home`;
		}
	};
}
