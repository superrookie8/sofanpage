import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthEnvironment } from "@/config/auth";

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
