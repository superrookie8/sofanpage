import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";

/** BFF: 클라이언트 Authorization 헤더 또는 Next-Auth 세션에서 access token 추출 */
export async function getRequestAccessToken(
	req: NextRequest
): Promise<string | null> {
	const authHeader = req.headers.get("authorization");
	if (authHeader?.startsWith("Bearer ")) {
		return authHeader.slice(7).trim() || null;
	}

	const session = await getServerSession(authOptions);
	return session?.accessToken ?? null;
}
