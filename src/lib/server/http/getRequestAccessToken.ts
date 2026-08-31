import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthEnvironment } from "../../../config/auth";

/** BFF 전용: 암호화된 NextAuth JWT cookie에서만 backend token을 읽는다. */
export async function getRequestAccessToken(
	req: NextRequest
): Promise<string | null> {
	const token = await getToken({
		req,
		secret: getAuthEnvironment().nextAuthSecret,
	});
	return typeof token?.backendAccessToken === "string"
		? token.backendAccessToken
		: null;
}

/**
 * 공개 BFF 전용. 인증 설정이나 세션 쿠키가 없거나 손상돼도 익명 요청으로
 * 계속 진행한다. 보호 API는 반드시 getRequestAccessToken을 사용해야 한다.
 */
export async function getOptionalRequestAccessToken(
	req: NextRequest
): Promise<string | null> {
	const secret = process.env.NEXTAUTH_SECRET?.trim();
	if (!secret) return null;

	try {
		const token = await getToken({ req, secret });
		return typeof token?.backendAccessToken === "string"
			? token.backendAccessToken
			: null;
	} catch {
		return null;
	}
}
