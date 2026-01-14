// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Admin 경로 체크
	if (pathname.startsWith("/admin")) {
		const adminToken = request.cookies.get("admin-token");
		if (!adminToken) {
			return NextResponse.redirect(new URL("/admin/login", request.url));
		}
		return NextResponse.next();
	}

	// Diary 경로 체크 (로그인 필요)
	if (pathname.startsWith("/diary")) {
		// 모바일 사파리에서 쿠키 인식 문제를 해결하기 위해
		// 쿠키를 직접 확인하는 방법도 함께 사용
		const cookieName =
			process.env.NODE_ENV === "production"
				? "__Secure-next-auth.session-token"
				: "next-auth.session-token";
		const sessionCookie = request.cookies.get(cookieName);

		// 쿠키가 있으면 getToken으로 검증, 없으면 바로 리다이렉트
		if (!sessionCookie) {
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(loginUrl);
		}

		// 쿠키가 있어도 토큰 검증 시도
		const token = await getToken({
			req: request,
			secret: process.env.NEXTAUTH_SECRET,
		});

		if (!token) {
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(loginUrl);
		}
		return NextResponse.next();
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/:path*", "/diary/:path*"],
};
