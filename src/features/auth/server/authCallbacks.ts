import type { Account, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { getSafeCallbackUrl } from "../safeCallbackUrl";
import type { GoogleExchangeResult } from "./googleExchange";
import { GoogleExchangeError } from "./googleExchange";

export type GoogleIdentityExchange = (
	idToken: string
) => Promise<GoogleExchangeResult>;

export function createJwtCallback(exchangeIdentity: GoogleIdentityExchange) {
	return async ({
		token,
		account,
	}: {
		token: JWT;
		account?: Account | null;
	}): Promise<JWT> => {
		if (account) {
			if (account.provider !== "google" || !account.id_token) {
				throw new GoogleExchangeError("Unsupported or incomplete OAuth response");
			}

			const exchange = await exchangeIdentity(account.id_token);
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
