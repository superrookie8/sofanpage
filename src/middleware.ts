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
