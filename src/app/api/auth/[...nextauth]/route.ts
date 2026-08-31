// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getMissingAuthEnvironmentKeys } from "@/features/auth/server/authEnvironment";

type AuthRouteContext = {
	params: Promise<{ nextauth: string[] }>;
};

let configuredHandler: ReturnType<typeof NextAuth> | null = null;

async function getConfiguredHandler() {
	if (!configuredHandler) {
		const { getAuthOptions } = await import("@/config/auth");
		configuredHandler = NextAuth(getAuthOptions());
	}
	return configuredHandler;
}

async function handler(request: NextRequest, context: AuthRouteContext) {
	const missingAuthKeys = getMissingAuthEnvironmentKeys(process.env);
	if (missingAuthKeys.length > 0) {
		// SessionProvider가 공개 페이지 렌더링을 방해하지 않도록 비로그인 세션은
		// 정상 응답한다. 로그인/콜백 요청은 설정 오류로 fail closed한다.
		if (
			request.method === "GET" &&
			request.nextUrl.pathname.endsWith("/session")
		) {
			return NextResponse.json({}, { headers: { "Cache-Control": "no-store" } });
		}

		console.error(
			`Authentication request rejected. Missing configuration: ${missingAuthKeys.join(
				", "
			)}`
		);
		return NextResponse.json(
			{ error: "Authentication is not configured." },
			{ status: 503 }
		);
	}

	const configuredAuthHandler = await getConfiguredHandler();
	return configuredAuthHandler(request, context);
}

export { handler as GET, handler as POST };
