import type { NextAuthOptions } from "next-auth";
import type { Provider } from "next-auth/providers/index";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import type { AuthEnvironment } from "./authEnvironment";
import {
	createJwtCallback,
	createRedirectCallback,
	createSessionCallback,
	type GoogleIdentityExchange,
} from "./authCallbacks";
import { exchangeIdentity as exchangeIdentityRequest } from "./googleExchange";

export function createAuthOptions(
	environment: AuthEnvironment,
	exchangeIdentity: GoogleIdentityExchange = (provider, idToken) =>
		exchangeIdentityRequest(provider, idToken, environment)
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

	const providers: Provider[] = [googleProvider];

	// 자격증명이 없으면 카카오를 아예 등록하지 않는다. NextAuth가 provider 목록을
	// /api/auth/providers 로 그대로 노출하므로, 로그인 화면의 버튼 노출도 이 하나를 따른다.
	if (environment.kakao) {
		providers.push(createKakaoProvider(environment.kakao));
	}

	return {
		providers,
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

/**
 * NextAuth v4의 내장 Kakao provider는 OIDC가 아니라 일반 OAuth 설정이다
 * (userinfo를 kapi.kakao.com에서 읽고 scope가 비어 있으며 issuer/jwks가 없다).
 * 그대로 쓰면 두 군데서 막힌다.
 *
 * 1. scope에 openid가 없어 카카오가 id_token을 발급하지 않는다.
 * 2. id_token을 받아도 검증할 issuer/jwks_uri를 몰라
 *    "unexpected iss value, expected undefined"로 콜백이 실패한다.
 *
 * 그래서 discovery 문서를 물려 issuer·jwks_uri·엔드포인트를 한 번에 받게 하고,
 * scope를 명시한다. 카카오 앱 관리에서 OpenID Connect가 ON이어야 하는 것도 같은 이유다.
 * 토큰 엔드포인트 인증은 카카오가 client_secret_post만 지원한다(discovery로 전달됨).
 */
function createKakaoProvider(kakao: NonNullable<AuthEnvironment["kakao"]>) {
	const wellKnown = "https://kauth.kakao.com/.well-known/openid-configuration";
	const authorization = {
		params: { response_type: "code", scope: kakao.scope },
	};
	// id_token 클레임을 프로필로 쓴다. 내장 profile()은 kapi.kakao.com의
	// /v2/user/me 응답 모양(kakao_account.*)을 가정해서 여기서는 전부 undefined가 된다.
	const profile = (claims: Record<string, unknown>) => ({
		id: String(claims.sub ?? ""),
		name: (claims.nickname as string | undefined) ?? null,
		email: (claims.email as string | undefined) ?? null,
		image: (claims.picture as string | undefined) ?? null,
	});

	const provider = KakaoProvider({
		clientId: kakao.clientId,
		clientSecret: kakao.clientSecret,
		wellKnown,
		checks: ["pkce", "state", "nonce"],
		idToken: true,
		authorization,
		profile,
	});
	// Google provider와 같은 이유로 override를 provider 객체에도 직접 박는다.
	// v4는 사용자 지정값을 NextAuth가 병합할 때까지 `options` 아래에 두므로,
	// 병합 전 상태를 읽는 코드에서는 기본값이 보인다.
	provider.wellKnown = wellKnown;
	provider.checks = ["pkce", "state", "nonce"];
	provider.idToken = true;
	provider.authorization = authorization;
	provider.profile = profile;
	return provider;
}
