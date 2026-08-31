import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { AuthEnvironment } from "./authEnvironment";
import {
	createJwtCallback,
	createRedirectCallback,
	createSessionCallback,
	type GoogleIdentityExchange,
} from "./authCallbacks";
import { exchangeGoogleIdentity } from "./googleExchange";

export function createAuthOptions(
	environment: AuthEnvironment,
	exchangeIdentity: GoogleIdentityExchange = (idToken) =>
		exchangeGoogleIdentity(idToken, environment)
): NextAuthOptions {
	const googleProvider = GoogleProvider({
		clientId: environment.googleClientId,
		clientSecret: environment.googleClientSecret,
		checks: ["pkce", "state", "nonce"],
		authorization: {
			params: {
				prompt: "select_account",
				response_type: "code",
				scope: "openid email profile",
			},
		},
	});
	// GoogleProvider v4 keeps user overrides under `options` until NextAuth merges
	// them. Keep the effective checks explicit on the provider object as well.
	googleProvider.checks = ["pkce", "state", "nonce"];

	return {
		providers: [googleProvider],
		callbacks: {
			jwt: createJwtCallback(exchangeIdentity),
			session: createSessionCallback(),
			redirect: createRedirectCallback(),
		},
		pages: {
			signIn: "/login",
			error: "/login",
		},
		session: {
			strategy: "jwt",
			maxAge: 24 * 60 * 60,
		},
		secret: environment.nextAuthSecret,
		cookies: {
			sessionToken: {
				name:
					process.env.NODE_ENV === "production"
						? "__Secure-next-auth.session-token"
						: "next-auth.session-token",
				options: {
					httpOnly: true,
					sameSite: "lax",
					path: "/",
					secure: process.env.NODE_ENV === "production",
					maxAge: 24 * 60 * 60,
				},
			},
		},
	};
}
